import { TransportIdGeneratorService } from './transport-id-generator.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('TransportIdGeneratorService', () => {
  let service: TransportIdGeneratorService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      transportRegistration: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    service = new TransportIdGeneratorService(mockPrisma as PrismaService);
  });

  it('should generate transport ID conforming to TR{YY}-{6 CHARS}', async () => {
    const id = await service.generateUniqueId();
    expect(id).toMatch(/^TR\d{2}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
  });

  it('should regenerate if collision occurs', async () => {
    mockPrisma.transportRegistration.findUnique
      .mockResolvedValueOnce({ id: 'existing-id' })
      .mockResolvedValueOnce(null);

    const id = await service.generateUniqueId();
    expect(id).toBeDefined();
    expect(mockPrisma.transportRegistration.findUnique).toHaveBeenCalledTimes(2);
  });
});
