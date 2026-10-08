import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaymentsRegistryService } from './payments-registry.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsRegistry: PaymentsRegistryService) {}

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Headers('x-signature') signature: string,
    @Headers('x-webhook-signature') altSignature: string,
  ) {
    const sig = signature || altSignature || '';
    this.logger.log(`Webhook received for provider: ${provider}`);

    const paymentProvider = this.paymentsRegistry.getProvider(provider);
    await paymentProvider.handleWebhook(payload, sig);

    return { received: true };
  }
}
