import playwright from 'playwright-aws-lambda';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  let browser = null;
  try {
    browser = await playwright.launchChromium({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    });
    const page = await context.newPage();

    // 1. Ab hum Flipkart par search kar rahe hain
    const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(flipkartUrl, { waitUntil: 'networkidle', timeout: 15000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    // 2. Flipkart ke search result structure ke hisaab se data nikalenge
    const results = [];
    $('div[data-id]').each((index, element) => {
      // Yeh classes Flipkart ke search results ke liye hain
      const title = $(element).find('a[title]').attr('title');
      const price = $(element).find('div._30jeq3').text();
      const imageUrl = $(element).find('img._396cs4').attr('src');
      let productUrl = $(element).find('a[target="_blank"]').attr('href');

      if (title && price && imageUrl && productUrl) {
        // Flipkart relative URLs deta hai, unhein theek karna hoga
        if (!productUrl.startsWith('http')) {
          productUrl = 'https://www.flipkart.com' + productUrl;
        }
        
        results.push({
          title,
          price,
          imageUrl,
          productUrl,
          source: 'Flipkart',
        });
      }
    });
    
    // Sirf pehle 6 results hi lenge
    const finalResults = results.slice(0, 6);

    res.status(200).json({ results: finalResults });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scrape Flipkart. ' + error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}