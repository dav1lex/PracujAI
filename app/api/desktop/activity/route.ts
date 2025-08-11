import { NextRequest, NextResponse } from 'next/server';
import { validateDesktopSession, logDesktopActivity } from '@/utils/desktop-session';

export async function POST(request: NextRequest) {
    try {
        const { token, activity, metadata } = await request.json();

        // Validate the desktop session
        const sessionResult = await validateDesktopSession(token);

        if (!sessionResult.success) {
            return NextResponse.json(
                { error: sessionResult.error },
                { status: sessionResult.status || 500 }
            );
        }

        if (!activity) {
            return NextResponse.json(
                { error: 'Typ aktywności jest wymagany' },
                { status: 400 }
            );
        }

        // Log the desktop activity
        const logResult = await logDesktopActivity(sessionResult.user_id!, activity, metadata);

        if (!logResult.success) {
            return NextResponse.json(
                { error: logResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                message: 'Aktywność zarejestrowana',
                activity,
                timestamp: new Date().toISOString(),
                sessionId: sessionResult.session?.id
            }
        });

    } catch (error) {
        console.error('Error in /api/desktop/activity:', error);
        return NextResponse.json(
            { error: 'Błąd serwera' },
            { status: 500 }
        );
    }
}

// Get activity history for a desktop session
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Validate the desktop session
        const sessionResult = await validateDesktopSession(token!);

        if (!sessionResult.success) {
            return NextResponse.json(
                { error: sessionResult.error },
                { status: sessionResult.status || 500 }
            );
        }

        // Get activity history from credit_transactions (where amount = 0 and description starts with "Desktop Activity:")
        const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
        const { cookies } = await import('next/headers');
        const supabase = createRouteHandlerClient({ cookies });

        const { data: activities, error: activitiesError } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', sessionResult.user_id!)
            .eq('amount', 0)
            .ilike('description', 'Desktop Activity:%')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (activitiesError) {
            console.error('Error fetching desktop activities:', activitiesError);
            return NextResponse.json(
                { error: 'Błąd podczas pobierania historii aktywności' },
                { status: 500 }
            );
        }

        // Parse the activities to extract activity type and metadata
        const parsedActivities = activities?.map(activity => {
            const description = activity.description || '';
            const activityMatch = description.match(/^Desktop Activity: (.+?)(?:\s-\s(.+))?$/);

            return {
                id: activity.id,
                activity: activityMatch?.[1] || 'Unknown',
                metadata: activityMatch?.[2] ? JSON.parse(activityMatch[2]) : null,
                timestamp: activity.created_at
            };
        }) || [];

        return NextResponse.json({
            success: true,
            data: {
                activities: parsedActivities,
                total: activities?.length || 0,
                sessionId: sessionResult.session?.id
            }
        });

    } catch (error) {
        console.error('Error in GET /api/desktop/activity:', error);
        return NextResponse.json(
            { error: 'Błąd serwera' },
            { status: 500 }
        );
    }
}