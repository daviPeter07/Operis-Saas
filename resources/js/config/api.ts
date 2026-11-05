import { withAppBasePath } from '@/constants/workspace';

/** API root: /operis/api in production, /api when VITE_APP_BASE_PATH is empty (local dev). */
export const apiBasePath = withAppBasePath('/api');
