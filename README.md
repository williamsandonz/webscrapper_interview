# William Sando's Web Scraper

Written in Node 18.15.0

    'npm install npx -g'
    'npm install'
    'npx playwright test'
    'npx playwright show-report'
    
### What would I do with more time?

* Queues
    * Obviously the ideal architecture would be dependent on the exact use-case but in general a strong strategy for this sort of application would be to provision a Lambda (Serverless) to handle the execution of the scraping. This lambda could be triggered via an SQS queue which would store the pending items to be scraped. Finally, a scheduled lambda could be leveraged to push pages onto the queue on a frequent basis.
    * By using this approach we would gain all the benefits of using queues (a,b,c TODO).
    * Failed items due to HTTP 410 events would land in a Dead-letter queue (DLQ) whereby they could be removed from the queue.
    * Failed items due to changes in markup over time, bot detection or an unexpected issue would also land in a Dead-letter queue (DLQ) but could be diagnosed and subsequently re-processed.
* Infrastructure as Code (IaC)
    * Provisioning this with CDK + Github Actions piplines would empower us to easily create non-production environments as well. This would enable us to easily develop the scraper wtihout worrying about corrupted the scraped data in production.
* Data storage & audit trails
    * I would store the scraped data in a low latency NoSQL database that is lambda adjacent such as DynamoDB.
    * All scraped data would be stored with additional meta data such as timestamp, execution run number etc to enable easy rollbackability. I.E If it was later discovered that some of that data was erroneous/malformed.
* Bot detection
    * It's not uncommon for websites to protect themselves against automatic scripts such as web scrapers or DDOS attacks so it's plausible that the scraper could be blocked. To circumvent this, the most promising solution would be to not use a single static outbound IP or MAC address. This could be achieved by using VPN tunneling or just cycling through some elastic Ips.
* Alerting
    * Due to the brittle nature of web scrapers it is likely that failures will inevitably arise. In these scenarios it would be helpful to have immediatel visibility of the issues to ensure rapid triaging. Using AWS SNS Topics to alert to applications like PagerDuty and slack could help in this regard.
* Security & Denial of Wallet protection
    * Protect the lambda against DoW attacks and also ensure malicious users can't trigger any unauthorised scrapping as this could be used to not only cost TravelNest a lot of money in Lambda costs but also to launch a DDOS attack on AirBNB. 
    * Possibly solution: SQS.sendMessage() could contain a secret in it's payload that the lambda could check before executing. This would be injected via the Scheduled lambda using something like Secret Manager or similiar.
* Ethical & legal scraping
    * It would be wise to check the legal and ethical guidelines are conformed to. For example, ensuring no personal data is scraped whether via omission or obfuscation.
* Enhanced robustness
    * One of my immediate concerns when developing a scrapper is the inherit brittleness due to DOM variability. I.E, Unbeknownst to us AirBNB may be serving slightly different pages to different members of the public. There are many scenarios when this can arise such as: A/B testing, conditionally pushing new features to a subset of users based on IP/Geography, device type or just a random % of traffic. 
    * This a tricky issue to solve and would require some discovery. One potential solution would be to use image diff software that would run prior to the scraper. It would take a snapshot and compare to the previous render and if any significant differences were present it would alert and not continuing with the execution of the scraper. Or you could create a discovery scraper that would poll from different device types, locations and issue many requests to search for A/B scenarios.