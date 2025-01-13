import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');
  
  // Always fetch earnings for all users from Supabase
  try {
    const { data, error: earningsError } = await supabase
      .from('earnings_calls')
      .select('ticker, call_date, market_session, logo_url')
      .order('call_date', { ascending: true });

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError);
      return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
    }
    
    // Transform the data to match your current format
    const formattedData = data.map(entry => ({
      ticker: entry.ticker,
      earnings_date: entry.call_date,
      market_session: entry.market_session,
      logo_url: entry.logo_url
    }));

    if (!user_id) {
      return NextResponse.json(formattedData);
    }

    // For authenticated users, fetch their favorites from Supabase
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('ticker')
      .eq('user_id', user_id);

    if (favoritesError) {
      console.error("Supabase error:", favoritesError.message);
      return NextResponse.json(formattedData);
    }

    // Create a set of starred tickers for fast lookup
    const starredTickers = new Set(favorites?.map(f => f.ticker) || []);
    
    // Enhance the earnings data with `isStarred` property
    const enhancedEarnings = formattedData.map((entry) => ({
      ...entry,
      isStarred: starredTickers.has(entry.ticker),
    }));
    
    return NextResponse.json(enhancedEarnings);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } 
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, ticker } = body;

    if (!user_id || !ticker) {
      console.log('Missing required fields:', { user_id, ticker });
      return NextResponse.json(
        { error: 'user_id and ticker are required' },
        { status: 400 }
      );
    }
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id,
          ticker,
          created_at: new Date().toISOString()
        }])
        .select();
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      console.log('Successfully inserted favorite:', data);
      return NextResponse.json({
        success: true,
        data
      });
    } catch (supabaseError) {
      console.error('Supabase operation error:', supabaseError);
      return NextResponse.json(
        { error: 'Database operation failed', details: supabaseError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { user_id, ticker } = body;
    if (!user_id || !ticker) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'user_id and ticker are required' }, 
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user_id)
      .eq('ticker', ticker);
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}