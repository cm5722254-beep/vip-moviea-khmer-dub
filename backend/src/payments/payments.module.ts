import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsRegistryService } from './payments-registry.service';
import { ManualPaymentProvider } from './providers/manual.provider';

@Module({
  controllers: [PaymentsController],
  providers: [ManualPaymentProvider, PaymentsRegistryService],
  exports: [PaymentsRegistryService],
})
export class PaymentsModule {}
