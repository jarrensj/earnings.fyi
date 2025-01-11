import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('earnings_calls')
      .select('ticker, call_date, market_session')
      .order('call_date', { ascending: true });

    if (error) {
      console.error('Error fetching earnings:', error);
      return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
    }

    // Transform the data to match your current format
    const formattedData = data.map(entry => ({
      ticker: entry.ticker,
      earnings_date: entry.call_date,
      market_session: entry.market_session,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}