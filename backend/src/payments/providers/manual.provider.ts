import { Injectable, Logger } from '@nestjs/common';
import { BasePaymentProvider, DepositResult } from '../payment.service';

@Injectable()
export class ManualPaymentProvider extends BasePaymentProvider {
  private readonly logger = new Logger(ManualPaymentProvider.name);

  getProviderName(): string {
    return 'manual';
  }

  async createDeposit(data: {
    amount: number;
    currency: string;
    reference: string;
    userId: string;
    metadata?: Record<string, unknown>;
  }): Promise<DepositResult> {
    // Manual bank transfer — just return payment instructions
    // No external API call needed
    this.logger.log(`Manual deposit created: ref=${data.reference}, amount=${data.amount}`);

    const bankInfo = {
      bank: process.env.MANUAL_BANK_NAME || 'ABA Bank',
      accountName: process.env.MANUAL_ACCOUNT_NAME || 'អាធិរាជរឿង',
      accountNumber: process.env.MANUAL_ACCOUNT_NUMBER || 'XXXXXXXX',
      currency: data.currency || 'USD',
    };

    return {
      success: true,
      reference: data.reference,
      instructions: [
        `1. ផ្ញើប្រាក់ទៅ ${bankInfo.bank}`,
        `2. ឈ្មោះគណនី: ${bankInfo.accountName}`,
        `3. លេខគណនី: ${bankInfo.accountNumber}`,
        `4. ចំនួន: ${data.amount} ${bankInfo.currency}`,
        `5. ចំណារ: ${data.reference}`,
        `6. ផ្ញើរូបភាពបង្ហាញការផ្ញើប្រាក់ទៅAdmin`,
      ].join('\n'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async verifyPayment(reference: string): Promise<boolean> {
    // Manual verification — admin approves manually in admin panel
    this.logger.log(`Manual payment verification for ref=${reference}`);
    // Return false — admin must approve via admin panel
    return false;
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    signature: string,
  ): Promise<void> {
    // Manual provider does not have webhooks
    this.logger.log('Manual provider webhook called (no-op)');
  }
}
