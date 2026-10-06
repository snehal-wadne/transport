import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@/auth/decorators/current-user.decorator';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated student profile' })
  @ApiResponse({ status: 200, description: 'Student profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.studentsService.getMyProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update contact details for current student' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMe(
    @CurrentUser('userId') userId: string,
    @Body() body: { mobile?: string },
  ) {
    return this.studentsService.updateMyProfile(userId, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Direct student record lookup by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student record' })
  @ApiResponse({ status: 403, description: 'Forbidden for student accounts' })
  async getStudentById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // CRITICAL DATA ISOLATION GUARD:
    // Normal students must NEVER query students by ID.
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        '403 Forbidden: Direct student record lookup by ID is strictly prohibited. Access is restricted to /students/me.',
      );
    }
    return this.studentsService.getStudentByIdAdmin(id);
  }
}
