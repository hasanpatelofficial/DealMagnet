import playwright from 'playwright-aws-lambda';
import cheerio from 'cheerio';

// Yeh Vercel ka official way hai serverless function banane ka
export default async function handler(req, res) {
  // 1. User ki search query ko URL se nikalo
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  let browser = null;
  try {
    // 2. Headless browser ko launch karo
    browser = await playwright.launchChromium({ headless: true });
    const context = await browser.newContext({
      // Amazon ko lagega ki hum ek real computer se aa rahe hain
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    });
    const page = await context.newPage();

    // 3. Amazon.in par jaakar product search karo
    const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    await page.goto(amazonUrl);
    
    // Page load hone ka intezar karo
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });

    // 4. Page ka poora HTML content nikalo
    const html = await page.content();
    const $ = cheerio.load(html);

    // 5. Har search result se data extract karo
    const results = [];
    $('[data-component-type="s-search-result"]').each((index, element) => {
      // Sirf pehle 5 results hi lenge
      if (index >= 5) return;

      const titleElement = $(element).find('h2 a.a-link-normal span.a-text-normal');
      const priceElement = $(element).find('.a-price-whole');
      const imageElement = $(element).find('img.s-image');
      const linkElement = $(element).find('h2 a.a-link-normal');

      const title = titleElement.text().trim();
      const price = priceElement.text().trim();
      const imageUrl = imageElement.attr('src');
      const productUrl = 'https://www.amazon.in' + linkElement.attr('href');

      // Sirf wahi results lo jinka title aur price dono ho
      if (title && price) {
        results.push({
          title,
          price: `₹${price}`,
          imageUrl,
          productUrl,
          source: 'Amazon',
        });
      }
    });
    
    // 6. Results ko JSON format mein wapas bhejo
    res.status(200).json({ results });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scrape Amazon. ' + error.message });
  } finally {
    // 7. Browser ko hamesha band karo
    if (browser) {
      await browser.close();
    }
  }
}