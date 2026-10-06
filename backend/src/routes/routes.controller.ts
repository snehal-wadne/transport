import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoutesService } from './routes.service';

@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active transport routes and pickup points' })
  @ApiResponse({ status: 200, description: 'Active routes list' })
  async getActiveRoutes() {
    return this.routesService.getActiveRoutes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific route with pickup points' })
  @ApiResponse({ status: 200, description: 'Route details' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  async getRouteById(@Param('id') id: string) {
    return this.routesService.getRouteById(id);
  }
}
