import { loggedInScraperTest } from './test-utils';
import { SearchMode } from './search';
import { QueryTweetsResponse } from './timeline-v1';

loggedInScraperTest(
  'scraper can process search cursor',
  async (scraper: Scraper) => {
    let cursor: string | undefined = undefined;
    const maxTweets = 30;
    let nTweets = 0;
    while (nTweets < maxTweets) {
      const res: QueryTweetsResponse = await scraper.fetchSearchTweets(
        'twitter',
        maxTweets,
        SearchMode.Top,
        cursor,
      );

      expect(res.next).toBeTruthy();

      nTweets += res.tweets.length;
      cursor = res.next;
    }
  },
  30000,
);

loggedInScraperTest(
  'scraper can search profiles',
  async (scraper: Scraper) => {
    const seenProfiles = new Map<string, boolean>();
    const maxProfiles = 150;
    let nProfiles = 0;

    const profiles = scraper.searchProfiles('Twitter', maxProfiles);
    for await (const profile of profiles) {
      nProfiles++;

      const profileId = profile.userId;
      expect(profileId).toBeTruthy();

      if (profileId != null) {
        expect(seenProfiles.has(profileId)).toBeFalsy();
        seenProfiles.set(profileId, true);
      }
    }

    expect(nProfiles).toEqual(maxProfiles);
  },
  30000,
);
import { Scraper } from './scraper';

loggedInScraperTest(
  'scraper can search tweets',
  async (scraper: Scraper) => {
    const seenTweets = new Map<string, boolean>();
    const maxTweets = 150;
    let nTweets = 0;

    const profiles = scraper.searchTweets(
      'twitter',
      maxTweets,
      SearchMode.Latest,
    );

    for await (const tweet of profiles) {
      nTweets++;

      const id = tweet.id;
      expect(id).toBeTruthy();

      if (id != null) {
        expect(seenTweets.has(id)).toBeFalsy();
        seenTweets.set(id, true);
      }

      expect(tweet.permanentUrl).toBeTruthy();
      expect(tweet.isRetweet).toBeFalsy();
      expect(tweet.text).toBeTruthy();
    }

    expect(nTweets).toEqual(maxTweets);
  },
  30000,
);
