import { VerificationService } from './verification.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { RegistrationStatus } from '@prisma/client';

describe('VerificationService — Privacy & Data Minimization', () => {
  let service: VerificationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      transportRegistration: {
        findUnique: jest.fn(),
      },
      transportationVerification: {
        create: jest.fn().mockResolvedValue({ id: 'v1' }),
      },
    };
    service = new VerificationService(mockPrisma as PrismaService);
  });

  it('should return minimal verification data and omit private personal details', async () => {
    mockPrisma.transportRegistration.findUnique.mockResolvedValue({
      id: 'internal-uuid-1234',
      transportationId: 'TR26-8F4K92',
      status: RegistrationStatus.APPROVED,
      student: {
        fullName: 'Harshal Patil',
        studentId: 'PRN2024001',
        branch: 'Computer Engineering',
        academicYear: '2024-2025',
      },
      route: {
        name: 'Route 5 — Kothrud & Karve Nagar',
      },
      pickupPoint: {
        name: 'Karve Nagar Chowk',
      },
    });

    const result = await service.verifyTransportId('TR26-8F4K92', '127.0.0.1');

    expect(result.transportationId).toBe('TR26-8F4K92');
    expect(result.status).toBe(RegistrationStatus.APPROVED);
    expect(result.studentName).toBe('Harshal Patil');
    expect(result.collegeName).toBe('City Engineering College');

    // CRITICAL DATA MINIMIZATION ASSERTIONS:
    expect((result as any).mobile).toBeUndefined();
    expect((result as any).email).toBeUndefined();
    expect((result as any).payment).toBeUndefined();
    expect((result as any).address).toBeUndefined();
    expect((result as any).internalId).toBeUndefined();
  });

  it('should throw NotFoundException if transport ID does not exist', async () => {
    mockPrisma.transportRegistration.findUnique.mockResolvedValue(null);

    await expect(service.verifyTransportId('TR99-NONEXIST', '127.0.0.1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
