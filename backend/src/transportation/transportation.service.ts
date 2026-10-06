import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TransportIdGeneratorService } from './transport-id-generator.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationStatus, PaymentStatus } from '@prisma/client';
import { AuditService } from '@/audit/audit.service';

@Injectable()
export class TransportationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: TransportIdGeneratorService,
    private readonly auditService: AuditService,
  ) {}

  async createRegistration(studentId: string, userId: string, dto: CreateRegistrationDto) {
    // 1. Prevent duplicate registrations for the same student
    const existing = await this.prisma.transportRegistration.findUnique({
      where: { studentId },
    });

    if (existing) {
      throw new ConflictException(
        'Duplicate registration prevented: You have already submitted a transportation registration.',
      );
    }

    // 2. Validate route and pickup point
    const route = await this.prisma.route.findUnique({
      where: { id: dto.routeId },
    });
    if (!route || !route.active) {
      throw new BadRequestException('Selected route is invalid or inactive');
    }

    const pickup = await this.prisma.pickupPoint.findFirst({
      where: { id: dto.pickupPointId, routeId: dto.routeId, active: true },
    });
    if (!pickup) {
      throw new BadRequestException('Selected pickup point does not belong to the chosen route');
    }

    // 3. Generate non-sequential, unique Transportation ID
    const transportationId = await this.idGen.generateUniqueId();

    const vehicleNumber = dto.vehicleNumber?.trim() || route.busNumber || 'TBD (Fleet Pool)';

    // 4. Create registration with forced PENDING status
    const registration = await this.prisma.transportRegistration.create({
      data: {
        studentId,
        transportationId,
        routeId: dto.routeId,
        pickupPointId: dto.pickupPointId,
        transportationType: dto.transportationType,
        vehicleNumber,
        status: RegistrationStatus.PENDING,
        submittedAt: new Date(),
      },
      include: {
        route: true,
        pickupPoint: true,
      },
    });

    // 5. If payment claim provided, create pending payment record
    if (dto.paymentClaim) {
      await this.prisma.payment.upsert({
        where: { studentId },
        create: {
          studentId,
          totalAmount: 18000.0,
          paidAmount: 0.0,
          pendingAmount: 18000.0,
          status: PaymentStatus.PENDING,
          paymentMode: dto.paymentClaim.paymentMode,
          transactionRef: dto.paymentClaim.transactionRef,
          lastPaymentDate: new Date(dto.paymentClaim.paymentDate),
        },
        update: {
          paymentMode: dto.paymentClaim.paymentMode,
          transactionRef: dto.paymentClaim.transactionRef,
          lastPaymentDate: new Date(dto.paymentClaim.paymentDate),
        },
      });
    }

    // 6. Audit log
    await this.auditService.logAction({
      actorId: userId,
      action: 'STUDENT_SUBMITTED_REGISTRATION',
      entityType: 'TransportRegistration',
      entityId: registration.id,
      newValue: { transportationId, routeId: dto.routeId, pickupPointId: dto.pickupPointId },
    });

    return registration;
  }

  async getMyRegistration(studentId: string) {
    const registration = await this.prisma.transportRegistration.findUnique({
      where: { studentId },
      include: {
        route: true,
        pickupPoint: true,
        student: {
          include: {
            payment: true,
          },
        },
      },
    });

    return registration;
  }

  async updateMyRegistration(studentId: string, userId: string, dto: UpdateRegistrationDto) {
    const existing = await this.prisma.transportRegistration.findUnique({
      where: { studentId },
    });

    if (!existing) {
      throw new NotFoundException('No active transportation registration found to update.');
    }

    // Validate route and pickup point
    const route = await this.prisma.route.findUnique({
      where: { id: dto.routeId },
    });
    if (!route || !route.active) {
      throw new BadRequestException('Selected route is invalid or inactive');
    }

    const pickup = await this.prisma.pickupPoint.findFirst({
      where: { id: dto.pickupPointId, routeId: dto.routeId, active: true },
    });
    if (!pickup) {
      throw new BadRequestException('Selected pickup point does not belong to chosen route');
    }

    const vehicleNumber = dto.vehicleNumber?.trim() || route.busNumber || existing.vehicleNumber;

    // CRITICAL WORKFLOW ENFORCEMENT:
    // Any change to commuting preferences invalidates prior approval and forces PENDING status.
    // Student cannot self-approve changes.
    const updated = await this.prisma.transportRegistration.update({
      where: { studentId },
      data: {
        routeId: dto.routeId,
        pickupPointId: dto.pickupPointId,
        transportationType: dto.transportationType || existing.transportationType,
        vehicleNumber,
        status: RegistrationStatus.PENDING,
        adminNote: null,
      },
      include: {
        route: true,
        pickupPoint: true,
      },
    });

    await this.auditService.logAction({
      actorId: userId,
      action: 'STUDENT_UPDATED_TRANSPORT',
      entityType: 'TransportRegistration',
      entityId: updated.id,
      oldValue: { routeId: existing.routeId, pickupPointId: existing.pickupPointId, status: existing.status },
      newValue: { routeId: updated.routeId, pickupPointId: updated.pickupPointId, status: updated.status },
    });

    return updated;
  }

  async getMyStatus(studentId: string) {
    const registration = await this.prisma.transportRegistration.findUnique({
      where: { studentId },
      include: {
        student: {
          include: { payment: true },
        },
      },
    });

    if (!registration) {
      return {
        hasRegistered: false,
        status: null,
      };
    }

    return {
      hasRegistered: true,
      registrationId: registration.id,
      transportationId: registration.transportationId,
      status: registration.status,
      submittedAt: registration.submittedAt,
      approvedAt: registration.approvedAt,
      routeId: registration.routeId,
      pickupPointId: registration.pickupPointId,
      officialPaymentStatus: registration.student.payment?.status || 'PENDING',
    };
  }
}
