import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRouteDto, UpdateRouteDto, CreatePickupPointDto } from './dto/create-route.dto';
import { AuditService } from '@/audit/audit.service';

@Injectable()
export class RoutesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getActiveRoutes() {
    return this.prisma.route.findMany({
      where: { active: true },
      include: {
        pickupPoints: {
          where: { active: true },
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { routeCode: 'asc' },
    });
  }

  async getAllRoutes() {
    return this.prisma.route.findMany({
      include: {
        pickupPoints: {
          orderBy: { sequence: 'asc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { routeCode: 'asc' },
    });
  }

  async getRouteById(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        pickupPoints: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }

  async createRoute(dto: CreateRouteDto, adminId?: string) {
    const existing = await this.prisma.route.findUnique({
      where: { routeCode: dto.routeCode },
    });

    if (existing) {
      throw new ConflictException(`Route code ${dto.routeCode} already exists`);
    }

    const route = await this.prisma.route.create({
      data: {
        name: dto.name,
        routeCode: dto.routeCode,
        description: dto.description,
        busNumber: dto.busNumber,
        driverName: dto.driverName,
        driverContact: dto.driverContact,
        pickupPoints: dto.pickupPoints && dto.pickupPoints.length > 0
          ? {
              create: dto.pickupPoints.map((p, idx) => ({
                name: p.name,
                sequence: p.sequence ?? idx + 1,
                landmark: p.landmark,
                estimatedTime: p.estimatedTime,
              })),
            }
          : undefined,
      },
      include: {
        pickupPoints: true,
      },
    });

    if (adminId) {
      await this.auditService.logAction({
        actorId: adminId,
        action: 'ADMIN_CREATED_ROUTE',
        entityType: 'Route',
        entityId: route.id,
        newValue: route,
      });
    }

    return route;
  }

  async updateRoute(id: string, dto: UpdateRouteDto, adminId?: string) {
    const existing = await this.getRouteById(id);

    const updated = await this.prisma.route.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        busNumber: dto.busNumber,
        driverName: dto.driverName,
        driverContact: dto.driverContact,
        active: dto.active,
      },
      include: {
        pickupPoints: true,
      },
    });

    if (adminId) {
      await this.auditService.logAction({
        actorId: adminId,
        action: 'ADMIN_UPDATED_ROUTE',
        entityType: 'Route',
        entityId: id,
        oldValue: existing,
        newValue: updated,
      });
    }

    return updated;
  }

  async addPickupPoint(routeId: string, dto: CreatePickupPointDto, adminId?: string) {
    await this.getRouteById(routeId);

    const point = await this.prisma.pickupPoint.create({
      data: {
        routeId,
        name: dto.name,
        sequence: dto.sequence ?? 99,
        landmark: dto.landmark,
        estimatedTime: dto.estimatedTime,
      },
    });

    if (adminId) {
      await this.auditService.logAction({
        actorId: adminId,
        action: 'ADMIN_ADDED_PICKUP_POINT',
        entityType: 'PickupPoint',
        entityId: point.id,
        newValue: point,
      });
    }

    return point;
  }

  async deleteRoute(id: string, adminId?: string) {
    const existing = await this.getRouteById(id);

    // Deactivate instead of hard delete to preserve foreign keys
    const deactivated = await this.prisma.route.update({
      where: { id },
      data: { active: false },
    });

    if (adminId) {
      await this.auditService.logAction({
        actorId: adminId,
        action: 'ADMIN_DEACTIVATED_ROUTE',
        entityType: 'Route',
        entityId: id,
        oldValue: existing,
        newValue: deactivated,
      });
    }

    return deactivated;
  }
}
