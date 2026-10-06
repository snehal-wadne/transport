import { Controller, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@/auth/decorators/current-user.decorator';

@ApiTags('Payments (Student View)')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'View official fee and payment status for authenticated student (Read-Only)' })
  @ApiResponse({ status: 200, description: 'Student payment record' })
  async getMyPayment(@CurrentUser() user: AuthenticatedUser) {
    if (!user.studentId) {
      throw new BadRequestException('No student profile associated with authenticated account.');
    }
    return this.paymentsService.getMyPayment(user.studentId);
  }
}
