export { queryClient } from './client';

export { theme, getPopupContainer } from './antd';

const mode = import.meta.env.VITE_MODE;

const BASE_URL_MAP: Record<string, string> = {
  dev: import.meta.env.VITE_API_URL_DEV,
  pro: import.meta.env.VITE_API_URL_PRO,
  staging: import.meta.env.VITE_API_URL_STAGING,
};

const LOGIN_REDIRECT_MAP: Record<string, string> = {
  dev: import.meta.env.VITE_URL_REDIRECT_LOGIN_LOCAL,
  pro: import.meta.env.VITE_URL_REDIRECT_LOGIN_PRO,
  staging: import.meta.env.VITE_URL_REDIRECT_LOGIN_STAGING,
};

export const baseUrlConfig = {
  baseUrl: BASE_URL_MAP[mode],
};

export const redirectRouter = {
  login_redirect: LOGIN_REDIRECT_MAP[mode],
  support_adsive: import.meta.env.VITE_URL_PAGE_SP_ADVISE,
  support_content: import.meta.env.VITE_URL_PAGE_SP_CONTENT,
  support_system: import.meta.env.VITE_URL_PAGE_SP_SYSTEM,
};
