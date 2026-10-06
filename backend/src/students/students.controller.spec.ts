import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('StudentsController — Data Isolation & Access Control', () => {
  let controller: StudentsController;
  let mockStudentsService: any;

  beforeEach(() => {
    mockStudentsService = {
      getMyProfile: jest.fn().mockResolvedValue({
        fullName: 'Harshal Patil',
        studentId: 'PRN2024001',
      }),
      getStudentByIdAdmin: jest.fn().mockResolvedValue({
        fullName: 'Target Student',
        studentId: 'PRN2024999',
      }),
    };
    controller = new StudentsController(mockStudentsService as StudentsService);
  });

  it('should allow student to query their own profile via session userId', async () => {
    const result = await controller.getMe('usr-stu-01');
    expect(result.studentId).toBe('PRN2024001');
    expect(mockStudentsService.getMyProfile).toHaveBeenCalledWith('usr-stu-01');
  });

  it('CRITICAL ISOLATION: should throw 403 Forbidden when a student attempts arbitrary ID lookup', async () => {
    const studentUser = {
      userId: 'usr-stu-01',
      email: 'student1@college.local',
      role: Role.STUDENT,
    };

    await expect(controller.getStudentById('arbitrary-student-id-99', studentUser as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow Admin to look up student by ID', async () => {
    const adminUser = {
      userId: 'usr-admin-01',
      email: 'admin@college.local',
      role: Role.ADMIN,
    };

    const result = await controller.getStudentById('student-id-99', adminUser as any);
    expect(result.studentId).toBe('PRN2024999');
    expect(mockStudentsService.getStudentByIdAdmin).toHaveBeenCalledWith('student-id-99');
  });
});
