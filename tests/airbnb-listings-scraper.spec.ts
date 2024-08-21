import { test, expect } from '@playwright/test';
import { AirBNBListingsScraper } from './airbnb-listing-scraper';

test('AirBNB Listing Scraper', async ({ page }) => {

  // Define the listing ID we want to scrape.
  // Let's assume in a real-world automated scenario that this would be provided externally during runtime.
  // E.G An AWS SQS queue would include the id in sendMessage() & the lambda would receive it via the REST call.
  const listingId = 20669368; // <!-- Jake: You can swap these to test each listingId: 50633275. 33571268 
  
  const listingsScraper = new AirBNBListingsScraper(page, listingId);
  await listingsScraper.start();
  
  // await expect(true).toBe(true);
  
});
