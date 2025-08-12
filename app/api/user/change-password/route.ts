import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSecureAPIRoute, createSuccessResponse, createErrorResponse } from '@/utils/api-security';
import { securitySchemas } from '@/utils/security';
import { POLISH_CONTENT } from '@/utils/polish-content';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = createSecureAPIRoute(
  async (request: NextRequest, context) => {
    try {
      const { currentPassword, newPassword } = context.validatedData!;

      // Check if new password is same as current password
      if (currentPassword === newPassword) {
        return createErrorResponse(
          'Nowe hasło musi być inne niż obecne hasło',
          'SAME_PASSWORD',
          400
        );
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: context.user!.email!,
        password: currentPassword
      });

      if (signInError) {
        return createErrorResponse(
          'Obecne hasło jest nieprawidłowe',
          'INVALID_CURRENT_PASSWORD',
          400
        );
      }

      // Update password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        context.user!.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return createErrorResponse(
          'Nie udało się zaktualizować hasła',
          'PASSWORD_UPDATE_FAILED',
          500
        );
      }

      return createSuccessResponse(
        { updated: true },
        POLISH_CONTENT.success.passwordChanged
      );

    } catch (error) {
      console.error('Error in password change:', error);
      return createErrorResponse(
        'Błąd serwera',
        'INTERNAL_SERVER_ERROR',
        500
      );
    }
  },
  {
    requireAuth: true,
    requireCSRF: true,
    validation: {
      currentPassword: {
        type: 'string',
        required: true,
        min: 1
      },
      newPassword: {
        type: 'password',
        required: true
      }
    },
    rateLimit: { requests: 5, windowMs: 15 * 60 * 1000 } // 5 requests per 15 minutes
  }
);