import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { Request } from 'express';

@ApiTags('Public QR Verification')
@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get(':transportationId')
  @ApiOperation({
    summary: 'Public QR Code pass verification (Minimal disclosure for physical boarding)',
  })
  @ApiResponse({ status: 200, description: 'Pass verification details' })
  @ApiResponse({ status: 404, description: 'Invalid or unknown pass identifier' })
  async verifyPass(
    @Param('transportationId') transportationId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.verificationService.verifyTransportId(transportationId, ip);
  }
}
