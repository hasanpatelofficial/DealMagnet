import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { query } = req.query;
  const apiKey = process.env.SCRAPINGANT_API_KEY;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    
    // --- YAHAN PAR BADLAV HUA HAI: browser=true & country=IN add kiya gaya hai ---
    const scrapingAntUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(flipkartUrl)}&x-api-key=${apiKey}&browser=true&country=IN`;
    
    const response = await fetch(scrapingAntUrl);
    if (!response.ok) {
        throw new Error(`ScrapingAnt API failed with status: ${response.status}`);
    }
    const data = await response.json();

    const $ = cheerio.load(data.content);

    const results = [];
    $('div[data-id]').each((index, element) => {
      if (index >= 6) return;
      
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
    
    res.status(200).json({ results });

  } catch (error) {
    console.error("Scraping Error:", error);
    res.status(500).json({ error: 'Failed to scrape Flipkart. ' + error.message });
  }
}