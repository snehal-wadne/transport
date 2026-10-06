import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TransportIdGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a collision-resistant, cryptographically formatted Transportation ID.
   * Format: TR{YY}-{6 CHAR NON-AMBIGUOUS ALPHANUMERIC}
   * Example: TR26-8F4K92
   */
  async generateUniqueId(): Promise<string> {
    const currentYearShort = new Date().getFullYear().toString().slice(-2);
    // Non-ambiguous character set (no 0/O, 1/I to avoid confusion on physical cards)
    const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    let uniqueId = '';
    let isCollision = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (isCollision && attempts < maxAttempts) {
      attempts++;
      let randomPart = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomPart += charset[randomIndex];
      }

      uniqueId = `TR${currentYearShort}-${randomPart}`;

      // Collision check in database
      const existing = await this.prisma.transportRegistration.findUnique({
        where: { transportationId: uniqueId },
        select: { id: true },
      });

      if (!existing) {
        isCollision = false;
      }
    }

    if (isCollision) {
      // Fallback emergency timestamp entropy
      uniqueId = `TR${currentYearShort}-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    }

    return uniqueId;
  }
}
