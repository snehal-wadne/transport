import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';
import { AuditService } from '@/audit/audit.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getMyPayment(studentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { studentId },
    });

    if (!payment) {
      return {
        totalAmount: 18000,
        paidAmount: 0,
        pendingAmount: 18000,
        status: PaymentStatus.PENDING,
        lastPaymentDate: null,
      };
    }

    return payment;
  }

  async getAllPaymentsAdmin() {
    return this.prisma.payment.findMany({
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            branch: true,
            className: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updatePaymentAdmin(
    id: string,
    dto: {
      paidAmount: number;
      status?: PaymentStatus;
      transactionRef?: string;
    },
    adminId: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record ${id} not found`);
    }

    const total = Number(payment.totalAmount);
    const paid = Number(dto.paidAmount);

    if (paid < 0 || paid > total) {
      throw new BadRequestException('Paid amount must be between 0 and total fee');
    }

    const pending = total - paid;
    let computedStatus: PaymentStatus = PaymentStatus.PENDING;
    if (paid >= total) {
      computedStatus = PaymentStatus.PAID;
    } else if (paid > 0) {
      computedStatus = PaymentStatus.PARTIALLY_PAID;
    }

    const finalStatus = dto.status || computedStatus;

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        paidAmount: new Prisma.Decimal(paid),
        pendingAmount: new Prisma.Decimal(pending),
        status: finalStatus,
        transactionRef: dto.transactionRef || payment.transactionRef,
        lastPaymentDate: new Date(),
      },
    });

    await this.auditService.logAction({
      actorId: adminId,
      action: 'ADMIN_UPDATED_PAYMENT',
      entityType: 'Payment',
      entityId: id,
      oldValue: { paidAmount: payment.paidAmount, status: payment.status },
      newValue: { paidAmount: updated.paidAmount, status: updated.status },
    });

    return updated;
  }
}
