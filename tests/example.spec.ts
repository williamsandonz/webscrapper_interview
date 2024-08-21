import { test, expect } from '@playwright/test';
import { ListingDetailPage } from './listingDetailPage';

test('has title', async ({ page }) => {
  const listingDetailPage = new ListingDetailPage(page, 20669368);
  await listingDetailPage.goTo();
  const result = await listingDetailPage.getListingData();
  console.log(result);
  await expect(page).toHaveTitle(/Playwright/);
});
