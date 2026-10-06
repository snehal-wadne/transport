import { Module } from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { TransportationController } from './transportation.controller';
import { TransportIdGeneratorService } from './transport-id-generator.service';

@Module({
  controllers: [TransportationController],
  providers: [TransportationService, TransportIdGeneratorService],
  exports: [TransportationService, TransportIdGeneratorService],
})
export class TransportationModule {}
