import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyTransportId(transportationId: string, ipAddress?: string) {
    const reg = await this.prisma.transportRegistration.findUnique({
      where: { transportationId },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true,
            branch: true,
            academicYear: true,
          },
        },
        route: {
          select: {
            name: true,
          },
        },
        pickupPoint: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!reg) {
      throw new NotFoundException(
        `Transportation Pass with ID ${transportationId} was not found or is invalid.`,
      );
    }

    // Log the verification attempt
    try {
      await this.prisma.transportationVerification.create({
        data: {
          transportationId,
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      // Non-blocking
    }

    // CRITICAL DATA MINIMIZATION:
    // Only return minimum necessary public verification details.
    // NEVER expose mobile, email, payment amounts, or internal database UUIDs.
    return {
      transportationId: reg.transportationId,
      status: reg.status,
      studentName: reg.student.fullName,
      studentId: reg.student.studentId,
      branch: reg.student.branch,
      academicYear: reg.student.academicYear,
      route: reg.route.name,
      pickupPoint: reg.pickupPoint.name,
      verifiedAt: new Date().toISOString(),
      collegeName: 'City Engineering College',
    };
  }
}
