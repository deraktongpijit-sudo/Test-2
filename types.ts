export interface BillingRecord {
  bacode: string;
  accountclass: string;
  customer: string;
  billPeriod: string;
  amount: number;
  paymenttype: string;
  docType: string;
  ratecat: string;
  trsg: string;
  mru: string;
  duedatefirst: string;
}

export interface ProcessedStats {
  totalAmount: number;
  recordCount: number;
  averageAmount: number;
  periodTrends: { name: string; amount: number; count: number }[];
  paymentTypeDist: { name: string; value: number }[];
  topCustomers: { customer: string; amount: number }[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  GENERATING_STORY = 'GENERATING_STORY',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}