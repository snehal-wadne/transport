import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransportationType, PaymentMode } from '@prisma/client';

export class PaymentClaimDto {
  @ApiProperty({ example: 'UTR882910394821', description: 'Transaction / Challan reference number' })
  @IsString()
  @IsNotEmpty()
  transactionRef: string;

  @ApiProperty({ enum: PaymentMode, example: PaymentMode.UPI })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiProperty({ example: '2024-07-15', description: 'Date of payment deposit' })
  @IsString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty({ example: 18000, description: 'Claimed fee amount' })
  @IsNumber()
  claimedAmount: number;
}

export class CreateRegistrationDto {
  @ApiProperty({ example: 'uuid-route-id', description: 'Selected transportation route ID' })
  @IsString()
  @IsNotEmpty({ message: 'Route ID is required' })
  routeId: string;

  @ApiProperty({ example: 'uuid-pickup-point-id', description: 'Selected pickup boarding stop ID' })
  @IsString()
  @IsNotEmpty({ message: 'Pickup Point ID is required' })
  pickupPointId: string;

  @ApiProperty({ enum: TransportationType, default: TransportationType.BUS })
  @IsEnum(TransportationType)
  transportationType: TransportationType;

  @ApiProperty({ example: 'MH-12-TR-1001', required: false })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiProperty({ type: PaymentClaimDto, required: false })
  @IsOptional()
  paymentClaim?: PaymentClaimDto;
}

export class UpdateRegistrationDto {
  @ApiProperty({ example: 'uuid-route-id' })
  @IsString()
  @IsNotEmpty({ message: 'Route ID is required' })
  routeId: string;

  @ApiProperty({ example: 'uuid-pickup-point-id' })
  @IsString()
  @IsNotEmpty({ message: 'Pickup Point ID is required' })
  pickupPointId: string;

  @ApiProperty({ enum: TransportationType, required: false })
  @IsOptional()
  @IsEnum(TransportationType)
  transportationType?: TransportationType;

  @ApiProperty({ example: 'MH-12-TR-1005', required: false })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;
}
