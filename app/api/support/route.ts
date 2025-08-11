import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const { subject, description, category = 'general', priority = 'medium' } = await request.json();

    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    // Get the current user from the session
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the support ticket
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject,
        description,
        category,
        priority,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      ticket: data,
      message: 'Zgłoszenie zostało utworzone pomyślnie' 
    });

  } catch (error) {
    console.error('Support ticket API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the session
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's support tickets
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
    }

    return NextResponse.json({ tickets: tickets || [] });

  } catch (error) {
    console.error('Support ticket API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}