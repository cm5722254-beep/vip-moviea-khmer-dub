export interface DepositResult {
  success: boolean;
  reference: string;
  paymentUrl?: string;
  qrCode?: string;
  instructions?: string;
  expiresAt?: Date;
}

export abstract class BasePaymentProvider {
  abstract createDeposit(data: {
    amount: number;
    currency: string;
    reference: string;
    userId: string;
    metadata?: Record<string, unknown>;
  }): Promise<DepositResult>;

  abstract verifyPayment(reference: string): Promise<boolean>;

  abstract handleWebhook(
    payload: Record<string, unknown>,
    signature: string,
  ): Promise<void>;

  abstract getProviderName(): string;
}
