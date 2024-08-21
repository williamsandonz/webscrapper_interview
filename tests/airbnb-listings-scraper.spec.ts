import { test, expect } from '@playwright/test';
import { AirBNBListingsScraper } from './airbnb-listing-scraper';
import { expectedListings } from './expected-data';

test('It handles an 410 HTTP response from Air BNB (Missing listing)', async ({ page }) => {

  const listingId = 33571268;
  
  const listingsScraper = new AirBNBListingsScraper(page, listingId);
  
  try {
    const scrapedData = await listingsScraper.start();
  } catch(e) {
    await expect(e.message).toContain('410');
  }
  
});

test('It successfully scrapes data for an HTTP 200 call', async ({ page }) => {

  const listingId = 20669368; // 20669368 || 50633275
  
  const listingsScraper = new AirBNBListingsScraper(page, listingId);
  
  const scrapedData = await listingsScraper.start();
  const expectedData = expectedListings.find(expectedListing => expectedListing.listingId === listingId)?.data;
  
  await expect(expectedData).toEqual(scrapedData);
  
});
