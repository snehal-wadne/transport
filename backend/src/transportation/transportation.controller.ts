import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransportationService } from './transportation.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@/auth/decorators/current-user.decorator';

@ApiTags('Transportation (Student)')
@Controller('transport')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransportationController {
  constructor(private readonly transportService: TransportationService) {}

  @Post()
  @ApiOperation({ summary: 'Submit transportation registration for authenticated student' })
  @ApiResponse({ status: 201, description: 'Registration submitted with PENDING status' })
  @ApiResponse({ status: 409, description: 'Duplicate registration prevented' })
  async createRegistration(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRegistrationDto,
  ) {
    if (!user.studentId) {
      throw new BadRequestException('Authenticated account has no associated student profile.');
    }
    return this.transportService.createRegistration(user.studentId, user.userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current student own transportation record and ID pass' })
  @ApiResponse({ status: 200, description: 'Student transportation registration record' })
  async getMyRegistration(@CurrentUser() user: AuthenticatedUser) {
    if (!user.studentId) {
      throw new BadRequestException('Authenticated account has no associated student profile.');
    }
    return this.transportService.getMyRegistration(user.studentId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update commuter details for current student (Triggers admin verification)' })
  @ApiResponse({ status: 200, description: 'Details updated; status set to PENDING' })
  async updateMyRegistration(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateRegistrationDto,
  ) {
    if (!user.studentId) {
      throw new BadRequestException('Authenticated account has no associated student profile.');
    }
    return this.transportService.updateMyRegistration(user.studentId, user.userId, dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get registration and payment verification status for authenticated student' })
  @ApiResponse({ status: 200, description: 'Status summary' })
  async getMyStatus(@CurrentUser() user: AuthenticatedUser) {
    if (!user.studentId) {
      return { hasRegistered: false, status: null };
    }
    return this.transportService.getMyStatus(user.studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Direct transportation lookup by ID (Forbidden for normal students)' })
  @ApiResponse({ status: 403, description: 'Forbidden for students' })
  async getRegistrationById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // CRITICAL ACCESS CONTROL:
    // Students can NEVER view another student's transportation ID.
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        '403 Forbidden: Direct transportation record lookup by arbitrary ID is strictly prohibited. Access is restricted to /transport/me.',
      );
    }
    return this.transportService.getMyRegistration(id);
  }
}
