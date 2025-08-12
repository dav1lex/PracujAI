import { createCSRFTokenEndpoint } from '@/utils/api-security';

export const GET = createCSRFTokenEndpoint();
export const POST = createCSRFTokenEndpoint();