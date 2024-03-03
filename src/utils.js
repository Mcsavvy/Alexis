// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const API_URL = 'https://alexis-api-ed4af4cf5335.herokuapp.com';

/**
 * @typedef {{
 *  firstName: string | null;
 *  lastName: string | null;
 *  email: string | null;
 *  picture: string | null;
 * }} UserInfo
 */

export async function getAccessToken() {
  const cookies = await chrome.cookies.getAll({
    domain: 'alexis.futurdevs.tech',
    name: 'access_token',
  });
  if (cookies.length === 0) return null;
  return cookies[0].value;
}


/**
 * @returns {Promise<UserInfo | null>}
 */
export async function getUserInfo() {
  const userInfo = (await chrome.storage.session.get('userInfo')).userInfo
  console.log('User info:', userInfo)
  return userInfo
}

/**
 * @param {UserInfo} userInfo
 * @returns {void}
 * */
export function storeUserInfo(userInfo) {
  chrome.storage.session.set({ userInfo })
  console.log('User info stored:', userInfo)
}


export async function clearUserInfo() {
  await chrome.storage.session.remove('userInfo')
  console.log('User info cleared')
}

/**
 *
 * @param {string} accessToken
 * @returns {Promise<UserInfo>}
 */
export async function getMe(accessToken) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  })
  const info = await response.json()
  console.log('User info fetched:', info)
  return {
    firstName: info.first_name,
    lastName: info.last_name,
    email: info.email,
    picture: info.picture
  }
}

/**
 * @returns {Promise<boolean>}
 */
export async function authenticate() {
  /**@type {UserInfo | null} */
  const userInfo = await getUserInfo()
  if (userInfo) {
    setLoggedIn(true)
    console.log('User info found in storage:', userInfo)
    return true
  }
  const accessToken = await getAccessToken()
  if (!accessToken) {
    setLoggedIn(false)
    clearUserInfo()
    console.log('No access token found')
    return false
  }
  const me = await getMe(accessToken)
  setLoggedIn(true)
  storeUserInfo(me)
  return true
}

/**
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
  const loggedIn = (await chrome.storage.session.get('loggedIn')).loggedIn
  console.log('Logged in:', loggedIn)
  return loggedIn
}

/**
 * @param {boolean} loggedIn
 */
export async function setLoggedIn(loggedIn) {
  await chrome.storage.session.set({ loggedIn })
  console.log('Logged in:', loggedIn)
}


export function onLoginStatusChange(callback) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'session') return;
    if (changes.loggedIn) {
      callback(changes.loggedIn.newValue)
    }
  })
}

/**
 * @param {chrome.cookies.CookieChangeInfo} changeInfo
 * @returns
 */
export async function handleCookieChange(changeInfo) {
  if (changeInfo.cookie.domain !== 'alexis.futurdevs.tech') return;
  if (changeInfo.cookie.name !== 'access_token') return;
  clearUserInfo()
  setLoggedIn(!changeInfo.removed)
  authenticate()
}
