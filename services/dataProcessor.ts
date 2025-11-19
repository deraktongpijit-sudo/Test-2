import Papa from 'papaparse';
import { BillingRecord, ProcessedStats } from '../types';

export const parseCSV = (file: File): Promise<BillingRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data.map((row: any) => ({
            ...row,
            amount: parseFloat(row.amount) || 0,
          })) as BillingRecord[];
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const calculateStats = (data: BillingRecord[]): ProcessedStats => {
  const totalAmount = data.reduce((sum, record) => sum + record.amount, 0);
  const recordCount = data.length;
  const averageAmount = totalAmount / (recordCount || 1);

  // Period Trends
  const periodMap = new Map<string, { amount: number; count: number }>();
  data.forEach((record) => {
    const current = periodMap.get(record.billPeriod) || { amount: 0, count: 0 };
    periodMap.set(record.billPeriod, {
      amount: current.amount + record.amount,
      count: current.count + 1,
    });
  });

  const periodTrends = Array.from(periodMap.entries())
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Payment Type Distribution
  const paymentMap = new Map<string, number>();
  data.forEach((record) => {
    const type = record.paymenttype || 'Unknown';
    paymentMap.set(type, (paymentMap.get(type) || 0) + 1);
  });

  const paymentTypeDist = Array.from(paymentMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Top Customers
  const customerMap = new Map<string, number>();
  data.forEach((record) => {
    customerMap.set(record.customer, (customerMap.get(record.customer) || 0) + record.amount);
  });

  const topCustomers = Array.from(customerMap.entries())
    .map(([customer, amount]) => ({ customer, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    totalAmount,
    recordCount,
    averageAmount,
    periodTrends,
    paymentTypeDist,
    topCustomers,
  };
};