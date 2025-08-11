import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCors } from '@/utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withCors(async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get the current user from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if email is already in use by another user
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return NextResponse.json({ error: 'Failed to validate email' }, { status: 500 });
    }

    const emailExists = existingUser.users.some(u => u.email === email && u.id !== user.id);
    if (emailExists) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Update user email with verification required
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email: email,
      email_confirm: false // Require email verification
    });

    if (updateError) {
      console.error('Error updating email:', updateError);
      return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }

    // Send verification email
    const { error: verificationError } = await supabase.auth.resend({
      type: 'email_change',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?email_verified=true`
      }
    });

    if (verificationError) {
      console.error('Error sending verification email:', verificationError);
      // Don't fail the request if verification email fails to send
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email update initiated. Please check your new email address for verification link.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Error in email update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});