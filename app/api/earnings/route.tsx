import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import earnings from './earnings.json'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');

  // Always get the base earnings data
  const baseEarnings = earnings;

  // If no user_id, return the base earnings data
  if (!user_id) {
    return NextResponse.json(baseEarnings);
  }

  try {
    // For authenticated users, fetch their favorites from Supabase
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('ticker')
      .eq('user_id', user_id);

    if (error) {
      console.error("Supabase error:", error.message);
      // Even if there's an error getting favorites, return the base earnings
      return NextResponse.json(baseEarnings);
    }

    // Create a set of starred tickers for fast lookup
    const starredTickers = new Set(favorites?.map(f => f.ticker) || []);

    // Enhance the earnings data with `isStarred` property
    const enhancedEarnings = baseEarnings.map((entry) => ({
      ...entry,
      isStarred: starredTickers.has(entry.ticker),
    }));

    return NextResponse.json(enhancedEarnings);
  } catch (error) {
    console.error("Unexpected error:", error);
    // If anything goes wrong, still return the base earnings
    return NextResponse.json(baseEarnings);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, ticker } = body;

    // Detailed request logging
    console.log('POST request received:', {
      body,
      user_id,
      ticker,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_KEY,
      headers: Object.fromEntries(request.headers)
    });

    if (!user_id || !ticker) {
      console.log('Missing required fields:', { user_id, ticker });
      return NextResponse.json(
        { error: 'user_id and ticker are required' },
        { status: 400 }
      );
    }

    try {
      // Log Supabase client state
      console.log('Supabase client:', {
        isInitialized: !!supabase,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });

      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id,
          ticker,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        // Detailed error logging
        console.error('Supabase error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });

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

    console.log('DELETE request received:', { user_id, ticker }); // Debug log

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