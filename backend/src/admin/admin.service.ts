import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RegistrationStatus, PaymentStatus } from '@prisma/client';
import { AuditService } from '@/audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getDashboardStats() {
    const [
      totalStudents,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      changesRequiredRegistrations,
      totalRoutes,
      paymentsSummary,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.transportRegistration.count({ where: { status: RegistrationStatus.PENDING } }),
      this.prisma.transportRegistration.count({ where: { status: RegistrationStatus.APPROVED } }),
      this.prisma.transportRegistration.count({ where: { status: RegistrationStatus.REJECTED } }),
      this.prisma.transportRegistration.count({ where: { status: RegistrationStatus.CHANGES_REQUIRED } }),
      this.prisma.route.count({ where: { active: true } }),
      this.prisma.payment.aggregate({
        _sum: {
          paidAmount: true,
          pendingAmount: true,
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalStudents,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      changesRequiredRegistrations,
      activeTransportationPasses: approvedRegistrations,
      totalRoutes,
      finances: {
        totalFeeExpected: Number(paymentsSummary._sum.totalAmount || 0),
        totalFeeCollected: Number(paymentsSummary._sum.paidAmount || 0),
        totalFeePending: Number(paymentsSummary._sum.pendingAmount || 0),
      },
    };
  }

  async getRegistrations(status?: RegistrationStatus, search?: string) {
    return this.prisma.transportRegistration.findMany({
      where: {
        status: status || undefined,
        student: search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { studentId: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            mobile: true,
            branch: true,
            className: true,
            academicYear: true,
            payment: true,
          },
        },
        route: true,
        pickupPoint: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getRegistrationById(id: string) {
    const reg = await this.prisma.transportRegistration.findUnique({
      where: { id },
      include: {
        student: {
          include: { payment: true },
        },
        route: {
          include: { pickupPoints: true },
        },
        pickupPoint: true,
      },
    });

    if (!reg) {
      throw new NotFoundException(`Registration record with ID ${id} not found`);
    }

    return reg;
  }

  async approveRegistration(id: string, adminId: string) {
    const reg = await this.getRegistrationById(id);

    const approved = await this.prisma.transportRegistration.update({
      where: { id },
      data: {
        status: RegistrationStatus.APPROVED,
        approvedAt: new Date(),
        rejectedAt: null,
        adminNote: null,
      },
      include: {
        student: true,
        route: true,
        pickupPoint: true,
      },
    });

    await this.auditService.logAction({
      actorId: adminId,
      action: 'ADMIN_APPROVED_REGISTRATION',
      entityType: 'TransportRegistration',
      entityId: id,
      oldValue: { status: reg.status },
      newValue: { status: RegistrationStatus.APPROVED, transportationId: reg.transportationId },
    });

    return approved;
  }

  async rejectRegistration(id: string, reason: string, adminId: string) {
    const reg = await this.getRegistrationById(id);

    const rejected = await this.prisma.transportRegistration.update({
      where: { id },
      data: {
        status: RegistrationStatus.REJECTED,
        rejectedAt: new Date(),
        adminNote: reason || 'Application declined by transportation committee.',
      },
      include: {
        student: true,
        route: true,
        pickupPoint: true,
      },
    });

    await this.auditService.logAction({
      actorId: adminId,
      action: 'ADMIN_REJECTED_REGISTRATION',
      entityType: 'TransportRegistration',
      entityId: id,
      oldValue: { status: reg.status },
      newValue: { status: RegistrationStatus.REJECTED, reason },
    });

    return rejected;
  }

  async requestChanges(id: string, note: string, adminId: string) {
    const reg = await this.getRegistrationById(id);

    const updated = await this.prisma.transportRegistration.update({
      where: { id },
      data: {
        status: RegistrationStatus.CHANGES_REQUIRED,
        adminNote: note,
      },
      include: {
        student: true,
        route: true,
        pickupPoint: true,
      },
    });

    await this.auditService.logAction({
      actorId: adminId,
      action: 'ADMIN_REQUESTED_CHANGES',
      entityType: 'TransportRegistration',
      entityId: id,
      oldValue: { status: reg.status },
      newValue: { status: RegistrationStatus.CHANGES_REQUIRED, note },
    });

    return updated;
  }

  async getStudents(search?: string, branch?: string) {
    return this.prisma.student.findMany({
      where: {
        branch: branch || undefined,
        OR: search
          ? [
              { fullName: { contains: search, mode: 'insensitive' } },
              { studentId: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        registration: {
          include: {
            route: true,
            pickupPoint: true,
          },
        },
        payment: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async deactivateStudentTransport(studentId: string, adminId: string) {
    const reg = await this.prisma.transportRegistration.findUnique({
      where: { studentId },
    });

    if (!reg) {
      throw new NotFoundException('Student has no active registration to deactivate.');
    }

    const deactivated = await this.prisma.transportRegistration.update({
      where: { studentId },
      data: {
        status: RegistrationStatus.EXPIRED,
        adminNote: 'Deactivated by administrative authority.',
      },
    });

    await this.auditService.logAction({
      actorId: adminId,
      action: 'ADMIN_DEACTIVATED_TRANSPORT',
      entityType: 'TransportRegistration',
      entityId: reg.id,
      oldValue: { status: reg.status },
      newValue: { status: RegistrationStatus.EXPIRED },
    });

    return deactivated;
  }
}
