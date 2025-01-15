import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

// Create a custom Supabase client that includes the Clerk JWT
const createClerkSupabaseClient = async (req: NextRequest) => {
  const { getToken } = getAuth(req);
  const supabaseToken = await getToken({ template: 'supabase' });

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`
      }
    }
  });
};

// Ensure a row in `users` exists for the current Clerk user.
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const supabase = await createClerkSupabaseClient(req);
    
    //console.log('POST - Clerk User ID:', clerkUserId);

    if (!clerkUserId) {
      //console.log('POST - No Clerk user found');
      return NextResponse.json(
        { error: "No user found in Clerk session." },
        { status: 401 }
      );
    }

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkUserId)
      .single();

    //console.log('POST - Supabase check result:', { existing, error: existingError });

    if (existingError && existingError.code !== "PGRST116") {
      console.error('POST - Supabase error:', existingError);
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (!existing) {
      //console.log('POST - Creating new user');
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({ clerk_id: clerkUserId })
        .single();

      if (insertError) {
        console.error('POST - Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      //console.log('POST - New user created:', newUser);
      return NextResponse.json({ user: newUser }, { status: 200 });
    }

    //console.log('POST - Returning existing user:', existing);
    return NextResponse.json({ user: existing }, { status: 200 });
  } catch (error: any) {
    console.error('POST - Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get Favorites array for the current Clerk user
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const supabase = await createClerkSupabaseClient(req);
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "No user found in Clerk session." },
        { status: 401 }
      );
    }

    // Fetch the user's favorites
    const { data: row, error } = await supabase
      .from("users")
      .select("favorites")
      .eq("clerk_id", clerkUserId)
      .single();

    if (error || !row) {
      return NextResponse.json(
        { favorites: [] },
        { status: 404 }
      );
    }

    return NextResponse.json({ favorites: row.favorites }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add or remove a ticker in the favorites array for the current Clerk user.
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const supabase = await createClerkSupabaseClient(req);
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "No user found in Clerk session." },
        { status: 401 }
      );
    }

    const { favorites } = await req.json();  // Expect the complete favorites array

    // Update the entire favorites array
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ favorites: favorites })  // Replace entire favorites array
      .eq("clerk_id", clerkUserId)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
