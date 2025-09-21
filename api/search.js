import chromium from 'chrome-aws-lambda';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    
    const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(flipkartUrl, { waitUntil: 'networkidle0' });

    const html = await page.content();
    const $ = cheerio.load(html);

    const results = [];
    $('div[data-id]').each((index, element) => {
      const title = $(element).find('a[title]').attr('title');
      const price = $(element).find('div._30jeq3').text();
      const imageUrl = $(element).find('img._396cs4').attr('src');
      let productUrl = $(element).find('a[target="_blank"]').attr('href');

      if (title && price && imageUrl && productUrl) {
        if (!productUrl.startsWith('http')) {
          productUrl = 'https://www.flipkart.com' + productUrl;
        }
        results.push({ title, price, imageUrl, productUrl, source: 'Flipkart' });
      }
    });

    res.status(200).json({ results: results.slice(0, 6) });

  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape Flipkart. ' + error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}