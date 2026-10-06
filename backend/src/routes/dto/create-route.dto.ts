import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePickupPointDto {
  @ApiProperty({ example: 'Karve Bridge', description: 'Name of pickup point' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Stop sequence number' })
  @IsOptional()
  sequence?: number;

  @ApiProperty({ example: 'Near Sambhaji Park Gate', description: 'Prominent landmark' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: '07:30 AM', description: 'Scheduled arrival time' })
  @IsOptional()
  @IsString()
  estimatedTime?: string;
}

export class CreateRouteDto {
  @ApiProperty({ example: 'Route 5 — Kothrud & Karve Nagar', description: 'Route name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'R-05-KT', description: 'Unique route code' })
  @IsString()
  @IsNotEmpty()
  routeCode: string;

  @ApiProperty({ example: 'Via Karve Road, Cummins College, Warje', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'MH-12-TR-1005', required: false })
  @IsOptional()
  @IsString()
  busNumber?: string;

  @ApiProperty({ example: 'Mr. Nitin Jadhav', required: false })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiProperty({ example: '+91 98220 99001', required: false })
  @IsOptional()
  @IsString()
  driverContact?: string;

  @ApiProperty({ type: [CreatePickupPointDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePickupPointDto)
  pickupPoints?: CreatePickupPointDto[];
}

export class UpdateRouteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  busNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  driverContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
