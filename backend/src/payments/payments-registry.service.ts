import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ManualPaymentProvider } from './providers/manual.provider';
import { BasePaymentProvider } from './payment.service';

@Injectable()
export class PaymentsRegistryService {
  private readonly logger = new Logger(PaymentsRegistryService.name);
  private providers: Map<string, BasePaymentProvider> = new Map();

  constructor(private manualProvider: ManualPaymentProvider) {
    this.providers.set('manual', this.manualProvider);
    this.logger.log(`Payment providers registered: ${[...this.providers.keys()].join(', ')}`);
  }

  getProvider(name: string): BasePaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`Payment provider '${name}' រកមិនឃើញ`);
    }
    return provider;
  }

  getAllProviders(): string[] {
    return [...this.providers.keys()];
  }
}
