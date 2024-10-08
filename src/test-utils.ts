import { HttpsProxyAgent } from 'https-proxy-agent';
import { Scraper } from './scraper';

export type scraperTestFunc = (scraper: Scraper) => void;

export const testIfCanLogin = process.env['TWITTER_USERNAME']
  ? test
  : test.skip;

export function loggedInScraperTest(
  testName: string,
  testFunc: scraperTestFunc,
  timeout = 10000,
) {
  testIfCanLogin(
    testName,
    async () => await testFunc(await getScraper()),
    timeout,
  );
}

export function anonymousScraperTest(
  testName: string,
  testFunc: scraperTestFunc,
  timeout = 10000,
) {
  test(
    testName,
    async () => await testFunc(await getScraper({ authMethod: 'anonymous' })),
    timeout,
  );
}

export interface ScraperTestOptions {
  /**
   * Force the scraper to use username/password to authenticate instead of cookies. Only used
   * by this file for testing auth, but very unreliable. Should always use cookies to resume
   * session when possible.
   */
  authMethod: 'password' | 'cookies' | 'anonymous';
}

export async function getScraper(
  options: Partial<ScraperTestOptions> = { authMethod: 'cookies' },
) {
  const username = process.env['TWITTER_USERNAME'];
  const password = process.env['TWITTER_PASSWORD'];
  const email = process.env['TWITTER_EMAIL'];
  const twoFactorSecret = process.env['TWITTER_2FA_SECRET'];
  const cookies = process.env['TWITTER_COOKIES'];
  const proxyUrl = process.env['PROXY_URL'];
  let agent: any;

  if (options.authMethod === 'cookies' && !cookies) {
    console.warn(
      'TWITTER_COOKIES variable is not defined, reverting to password auth (not recommended)',
    );
    options.authMethod = 'password';
  }

  if (options.authMethod === 'password' && !(username && password)) {
    throw new Error(
      'TWITTER_USERNAME and TWITTER_PASSWORD variables must be defined.',
    );
  }

  if (proxyUrl) {
    agent = new HttpsProxyAgent(proxyUrl, {
      rejectUnauthorized: false,
    });
  }

  const scraper = new Scraper({
    transform: {
      request: (input, init) => {
        if (agent) {
          return [input, { ...init, agent }];
        }
        return [input, init];
      },
    },
  });

  if (options.authMethod === 'password') {
    await scraper.login(username!, password!, email, twoFactorSecret);
  } else if (options.authMethod === 'cookies') {
    await scraper.setCookies(JSON.parse(cookies!));
  }

  return scraper;
}
