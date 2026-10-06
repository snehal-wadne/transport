import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RoutesModule } from '@/routes/routes.module';
import { PaymentsModule } from '@/payments/payments.module';
import { StudentsModule } from '@/students/students.module';

@Module({
  imports: [RoutesModule, PaymentsModule, StudentsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
