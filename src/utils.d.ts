
export type UserInfo = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  picture: string | null;
};
export type LoginStatusChangeCallback = (loggedIn: boolean) => void;
interface Utils {
  onLoginStatusChange: (callback: LoginStatusChangeCallback) => void;
  getUserInfo: () => Promise<UserInfo | null>;
  getAccessToken: () => Promise<string | null>;
  storeAccessToken: (token: string) => Promise<void>;
  clearUserInfo: () => void;
  getMe: () => UserInfo;
  authenticate: () => boolean;
  isLoggedIn: () => boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  handleCookieChange: (changeInfo: chrome.cookies.CookieChangeInfo) => void;
}
declare const utils: Utils;
export default utils
