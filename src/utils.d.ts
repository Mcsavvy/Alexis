
export type UserInfo = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  picture: string | null;
};
export type Environ = {
  API_URL: string;
  INTRANET_ORIGIN: string;
  WEB_URL: string;
  LOGIN_URL: string;
  ACCESS_TOKEN_COOKIE_NAME: string;
  USER_DEFAULT_IMAGE: string;
  SENTRY_AUTH_TOKEN: string;
  SENTRY_DSN: string;
  NODE_ENV: string;
  SENTRY_ENABLED: string;
};
export const environ: Environ;
export type LoginStatusChangeCallback = (loggedIn: boolean) => void;
export const onLoginStatusChange: (callback: LoginStatusChangeCallback) => void;
export const getMe: () => UserInfo;
export const getUserInfo: () => Promise<UserInfo | null>;
export const getAccessToken: () => Promise<string | null>;
export const storeAccessToken: (token: string) => Promise<void>;
export const clearUserInfo: () => void;
export const authenticate: () => boolean;
export const isLoggedIn: () => Promise<boolean>;
export const setLoggedIn: (loggedIn: boolean) => void;
export const handleCookieChange: (changeInfo: chrome.cookies.CookieChangeInfo) => void;
export const saveCurrentThread: (threadId: string, project: string) => Promise<void>;
export const getFullName: (userInfo: UserInfo) => string;
export const getProfilePicture: (userInfo: UserInfo) => string;
export const getCurrentThread: (project: string) => Promise<string | null>;
export const getVersion: () => string;
