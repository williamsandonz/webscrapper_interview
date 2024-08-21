import { type Page } from "@playwright/test";

export class AirBNBListingsScraper {

  public data: ListingData = {
    title: '',
    type: ListingTypes.APARTMENT, // Arbitarily setting this as I can't see where this exists on the page...
    numberOfBedrooms: 0,
    numberOfBathrooms: 0,
    amenities: []
  };
  
  constructor(private page: Page, private listingId: number) {
  }
  
  async start(): Promise<ListingData> {
    const response = await this.page.goto(`https://www.airbnb.co.uk/rooms/${this.listingId}`);
    if(response === null) {
      throw new Error(`HTTP response was null for listing ${this.listingId}`);
    }
    if(response.status() === 410) {
      // This condition executes for listingId 33571268
      throw new Error(`Listing page cannot be found (410) for listing ${this.listingId}`);
    }
    await this.scrapeTitle();
    const overviewSection = await this.getOverviewSection();
    this.data.numberOfBedrooms = await this.scrapeTextWithinOverview(overviewSection, /([0-9]+)\sbedroom/, true) as number;
    this.data.numberOfBathrooms = await this.scrapeTextWithinOverview(overviewSection, /([0-9]+)\sbathroom/, true) as number;
    await this.scrapeAmenities();
    console.log(JSON.stringify(this.data));
    return this.data;
  }

  async scrapeTitle(): Promise<void> {
    const title = await this.page.locator('main h1').textContent();
    if(title === null) {
      throw new Error(this.formatError('Title is empty'));
    }
    this.data.title = title;
  }

  async getOverviewSection(): Promise<string> {
    const overviewSection = await this.page.locator('div[data-section-id=OVERVIEW_DEFAULT_V2]').textContent();
    if (overviewSection === null) {
      throw new Error(this.formatError('Overview section is empty'));
    };
    return overviewSection;
  }

  async scrapeTextWithinOverview(overviewSection: string, pattern: RegExp, parseToInteger: boolean): Promise<string|number> {
    const matchResult = overviewSection.match(pattern);
    if (matchResult === null || !matchResult[1]) {
      throw new Error(this.formatError('Regex match for text within overview was empty'));
    }
    if(!parseToInteger) {
      return matchResult[1];
    }
    const parsedInteger = parseInt(matchResult[1], 10);
    if(isNaN(parsedInteger)) {
      throw new Error(this.formatError('Failed to parse text within overview to an integer'));
    }
    return parsedInteger;
  }

  async scrapeAmenities(): Promise<void> {

    // Click the button to display all amenities in a newly opened modal
    await this.page.locator('*[data-section-id=AMENITIES_DEFAULT] button').click();

    const amenitiesContainerSelector = 'div[role=dialog] section > div > div';

    // Wait for the modal to be displayed
    await this.page.waitForSelector(amenitiesContainerSelector);

    
    const amenityCategories = await this.page.locator('div[role=dialog] section > div > div').all();
    for (const category of amenityCategories) {
      const categoryTitle = await category.locator('h3').textContent();
      if(categoryTitle === null) {
        throw new Error(this.formatError('Amenities category title is empty'));
      }
      const amenities = await category.locator('li').all();
      for (const amenity of amenities) {
        const amenityInfo = await amenity.locator('> div > div > div').last();
        const title = await amenityInfo.locator('> div').first().textContent();
        if(title === null) {
          throw new Error(this.formatError('Amenity title is empty'));
        }
        this.data.amenities.push({ title, category: { title: categoryTitle } });
      }
    }
  }

  private formatError(message: string): string {
    return `${message} for listing ${this.listingId}`;
  }

}

export interface ListingData {
  title: string;
  type: ListingTypes;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  amenities: Amenity[];
}
export enum ListingTypes {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE'
}
export interface Amenity {
  title: string;
  category: AmenityCategory;
}
export interface AmenityCategory {
  title: string;
}