import { Scraper } from './scraper';
import { loggedInScraperTest } from './test-utils';

loggedInScraperTest(
  'scraper can get trends',
  async (scraper: Scraper) => {
    const trends = await scraper.getTrends();
    expect(trends).toHaveLength(20);
    trends.forEach((trend) => expect(trend).not.toBeFalsy());
  },
  15000,
);
