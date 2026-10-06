import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RoutesService } from '@/routes/routes.service';
import { PaymentsService } from '@/payments/payments.service';
import { AuditService } from '@/audit/audit.service';
import { StudentsService } from '@/students/students.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Role, RegistrationStatus, PaymentStatus } from '@prisma/client';
import { CreateRouteDto, UpdateRouteDto, CreatePickupPointDto } from '@/routes/dto/create-route.dto';

@ApiTags('Admin Portal')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly routesService: RoutesService,
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AuditService,
    private readonly studentsService: StudentsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get consolidated admin dashboard metrics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('registrations')
  @ApiOperation({ summary: 'List and filter student transportation registrations' })
  @ApiQuery({ name: 'status', enum: RegistrationStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  async getRegistrations(
    @Query('status') status?: RegistrationStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.getRegistrations(status, search);
  }

  @Get('registrations/:id')
  @ApiOperation({ summary: 'Inspect full student registration record for review' })
  async getRegistrationById(@Param('id') id: string) {
    return this.adminService.getRegistrationById(id);
  }

  @Post('registrations/:id/approve')
  @ApiOperation({ summary: 'Approve student transportation registration (Pass becomes ACTIVE)' })
  async approveRegistration(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.adminService.approveRegistration(id, adminId);
  }

  @Post('registrations/:id/reject')
  @ApiOperation({ summary: 'Reject student transportation registration with reason' })
  async rejectRegistration(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.adminService.rejectRegistration(id, reason, adminId);
  }

  @Post('registrations/:id/request-changes')
  @ApiOperation({ summary: 'Request adjustments to student registration details' })
  async requestChanges(
    @Param('id') id: string,
    @Body('note') note: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.adminService.requestChanges(id, note, adminId);
  }

  @Get('students')
  @ApiOperation({ summary: 'Search and filter all student records' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'branch', required: false })
  async getStudents(
    @Query('search') search?: string,
    @Query('branch') branch?: string,
  ) {
    return this.adminService.getStudents(search, branch);
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'View comprehensive student profile and transport history' })
  async getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentByIdAdmin(id);
  }

  @Post('students/:id/deactivate-transport')
  @ApiOperation({ summary: 'Deactivate student transportation pass' })
  async deactivateStudent(
    @Param('id') studentId: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.adminService.deactivateStudentTransport(studentId, adminId);
  }

  @Get('routes')
  @ApiOperation({ summary: 'List all managed routes and pickup points' })
  async getAllRoutes() {
    return this.routesService.getAllRoutes();
  }

  @Post('routes')
  @ApiOperation({ summary: 'Create new transport route' })
  async createRoute(
    @Body() dto: CreateRouteDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.routesService.createRoute(dto, adminId);
  }

  @Patch('routes/:id')
  @ApiOperation({ summary: 'Update existing transport route' })
  async updateRoute(
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.routesService.updateRoute(id, dto, adminId);
  }

  @Post('routes/:id/pickup-points')
  @ApiOperation({ summary: 'Add pickup point to existing route' })
  async addPickupPoint(
    @Param('id') routeId: string,
    @Body() dto: CreatePickupPointDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.routesService.addPickupPoint(routeId, dto, adminId);
  }

  @Delete('routes/:id')
  @ApiOperation({ summary: 'Deactivate a transport route' })
  async deleteRoute(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.routesService.deleteRoute(id, adminId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'View fee payment audit and reconciliation statistics' })
  async getPayments() {
    return this.paymentsService.getAllPaymentsAdmin();
  }

  @Patch('payments/:id')
  @ApiOperation({ summary: 'Reconcile and update student official payment record' })
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: { paidAmount: number; status?: PaymentStatus; transactionRef?: string },
    @CurrentUser('userId') adminId: string,
  ) {
    return this.paymentsService.updatePaymentAdmin(id, dto, adminId);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Inspect immutable administrative security audit trail' })
  async getAuditLogs() {
    return this.auditService.getLogs(100);
  }
}
