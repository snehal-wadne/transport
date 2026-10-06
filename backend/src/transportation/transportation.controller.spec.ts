import { TransportationController } from './transportation.controller';
import { TransportationService } from './transportation.service';
import { RegistrationStatus } from '@prisma/client';

describe('TransportationController — Workflow and Session Binding', () => {
  let controller: TransportationController;
  let mockTransportationService: any;

  beforeEach(() => {
    mockTransportationService = {
      createRegistration: jest.fn().mockResolvedValue({
        id: 'reg-01',
        transportationId: 'TR26-8F4K92',
        status: RegistrationStatus.PENDING,
      }),
      getMyRegistration: jest.fn().mockResolvedValue({
        id: 'reg-01',
        transportationId: 'TR26-8F4K92',
        status: RegistrationStatus.APPROVED,
      }),
      updateMyRegistration: jest.fn().mockResolvedValue({
        id: 'reg-01',
        transportationId: 'TR26-8F4K92',
        status: RegistrationStatus.PENDING, // Reset to PENDING on route change!
      }),
    };
    controller = new TransportationController(mockTransportationService as TransportationService);
  });

  it('submitting transport registration enforces PENDING status and binds to session studentId', async () => {
    const user = {
      userId: 'usr-stu-01',
      studentId: 'stu-01',
      role: 'STUDENT',
      email: 'student1@college.local',
    };

    const result = await controller.createRegistration(user as any, {
      routeId: 'route-1',
      pickupPointId: 'pp-1-1',
      transportationType: 'bus' as any,
    });

    expect(result.status).toBe(RegistrationStatus.PENDING);
    expect(mockTransportationService.createRegistration).toHaveBeenCalledWith(
      'stu-01',
      'usr-stu-01',
      expect.anything(),
    );
  });

  it('updating commuting details via /transport/me resets status to PENDING for admin re-verification', async () => {
    const user = {
      userId: 'usr-stu-01',
      studentId: 'stu-01',
      role: 'STUDENT',
      email: 'student1@college.local',
    };

    const result = await controller.updateMyRegistration(user as any, {
      routeId: 'route-2',
      pickupPointId: 'pp-2-1',
    });

    expect(result.status).toBe(RegistrationStatus.PENDING);
    expect(mockTransportationService.updateMyRegistration).toHaveBeenCalledWith(
      'stu-01',
      'usr-stu-01',
      expect.anything(),
    );
  });
});
