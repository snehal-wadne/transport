import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RoutesService } from '@/routes/routes.service';
import { PaymentsService } from '@/payments/payments.service';
import { AuditService } from '@/audit/audit.service';
import { StudentsService } from '@/students/students.service';
import { RegistrationStatus } from '@prisma/client';

describe('AdminController — Workflow Actions', () => {
  let controller: AdminController;
  let mockAdminService: any;
  let mockRoutesService: any;
  let mockPaymentsService: any;
  let mockAuditService: any;
  let mockStudentsService: any;

  beforeEach(() => {
    mockAdminService = {
      getDashboardStats: jest.fn().mockResolvedValue({
        totalStudents: 5,
        pendingRegistrations: 1,
        approvedRegistrations: 1,
        rejectedRegistrations: 1,
        changesRequiredRegistrations: 1,
        activeTransportationPasses: 1,
        totalRoutes: 5,
        finances: { totalExpected: 72000, totalCollected: 27000, totalPending: 45000 },
      }),
      approveRegistration: jest.fn().mockResolvedValue({
        id: 'reg-01',
        status: RegistrationStatus.APPROVED,
      }),
      requestChanges: jest.fn().mockResolvedValue({
        id: 'reg-02',
        status: RegistrationStatus.CHANGES_REQUIRED,
      }),
      rejectRegistration: jest.fn().mockResolvedValue({
        id: 'reg-03',
        status: RegistrationStatus.REJECTED,
      }),
    };

    mockRoutesService = {};
    mockPaymentsService = {};
    mockAuditService = {};
    mockStudentsService = {};

    controller = new AdminController(
      mockAdminService as AdminService,
      mockRoutesService as RoutesService,
      mockPaymentsService as PaymentsService,
      mockAuditService as AuditService,
      mockStudentsService as StudentsService,
    );
  });

  it('should return admin dashboard statistics', async () => {
    const stats = await controller.getDashboard();
    expect(stats.totalStudents).toBe(5);
    expect(stats.pendingRegistrations).toBe(1);
    expect(mockAdminService.getDashboardStats).toHaveBeenCalled();
  });

  it('should allow admin to approve a pending registration', async () => {
    const res = await controller.approveRegistration('reg-01', 'adm-01');
    expect(res.status).toBe(RegistrationStatus.APPROVED);
    expect(mockAdminService.approveRegistration).toHaveBeenCalledWith('reg-01', 'adm-01');
  });

  it('should allow admin to request changes with remarks', async () => {
    const res = await controller.requestChanges('reg-02', 'Stop full', 'adm-01');
    expect(res.status).toBe(RegistrationStatus.CHANGES_REQUIRED);
    expect(mockAdminService.requestChanges).toHaveBeenCalledWith('reg-02', 'Stop full', 'adm-01');
  });

  it('should allow admin to reject registration with reason', async () => {
    const res = await controller.rejectRegistration('reg-03', 'Invalid payment', 'adm-01');
    expect(res.status).toBe(RegistrationStatus.REJECTED);
    expect(mockAdminService.rejectRegistration).toHaveBeenCalledWith('reg-03', 'Invalid payment', 'adm-01');
  });
});
