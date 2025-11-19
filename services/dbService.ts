import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ProcessedStats } from '../types';

export const saveAnalysisToDB = async (stats: ProcessedStats, story: string) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Skipping database save.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('analysis_reports')
      .insert([
        {
          total_revenue: stats.totalAmount,
          transaction_count: stats.recordCount,
          average_ticket: stats.averageAmount,
          top_customer_name: stats.topCustomers[0]?.customer || 'N/A',
          period_trends: stats.periodTrends,
          payment_distribution: stats.paymentTypeDist,
          top_customers: stats.topCustomers,
          ai_narrative: story
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
};