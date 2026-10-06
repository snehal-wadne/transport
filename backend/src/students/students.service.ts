import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        registration: {
          include: {
            route: true,
            pickupPoint: true,
          },
        },
        payment: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found for authenticated user');
    }

    return student;
  }

  async updateMyProfile(userId: string, data: { mobile?: string }) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.prisma.student.update({
      where: { userId },
      data: {
        mobile: data.mobile || student.mobile,
      },
    });
  }

  async getStudentByIdAdmin(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        registration: {
          include: {
            route: true,
            pickupPoint: true,
          },
        },
        payment: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }
}
