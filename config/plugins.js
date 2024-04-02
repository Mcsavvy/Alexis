class EnvValidatePlugin {
  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const keys = [
      'API_URL',
      'INTRANET_ORIGIN',
      'WEB_URL',
      'LOGIN_URL',
      'ACCESS_TOKEN_COOKIE_NAME',
      'USER_DEFAULT_IMAGE',
      'SENTRY_AUTH_TOKEN',
      'SENTRY_DSN',
      'NODE_ENV',
      'SENTRY_ENABLED',
    ];
    console.log(`Validating environment variables`);
    for (const key of keys) {
      console.log(`>  ${key}=${process.env[key]}`);
      if (!process.env[key]) {
        throw new Error(`Missing environment variable: '${key}'`);
      }
    }
  }
}

module.exports = {
  EnvValidatePlugin
}
