import { type Locator, type Page } from "@playwright/test";

export class ListingDetailPage {
    
  readonly page: Page;
  readonly pinnedRepositories: Locator;
  readonly listingId: number;
  
  constructor(page: Page, listingId: number) {
    this.page = page;
    this.listingId = listingId;
  }
  
  async goTo() {
    return this.page.goto(`https://www.airbnb.co.uk/rooms/${this.listingId}`);
  }

  async getListingData() {
    const title = await this.page.locator('main h1').textContent();
    return title;
  }
  
}