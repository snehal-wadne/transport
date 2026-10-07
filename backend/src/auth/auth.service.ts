import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase().trim() },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            branch: true,
            className: true,
            academicYear: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        tokenType: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          student: user.student || null,
        },
      };
    }

    async register(dto: { email: string; password?: string; fullName?: string; prn?: string }) {
      const email = dto.email.toLowerCase().trim();
      const existing = await this.prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
        },
      });

      if (existing) {
        const payload = {
          sub: existing.id,
          email: existing.email,
          role: existing.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
          accessToken,
          tokenType: 'Bearer',
          user: {
            id: existing.id,
            email: existing.email,
            role: existing.role,
            student: existing.student || null,
          },
        };
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dto.password || 'password123', salt);

      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'STUDENT',
        },
      });

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        tokenType: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          student: null,
        },
      };
    }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            mobile: true,
            branch: true,
            className: true,
            academicYear: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }
}
