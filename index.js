const express = require('express');
const path = require('path');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

let chromium;
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on Vercel
  chromium = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  // running locally
  puppeteer = require('puppeteer');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', async (req, res) => {
  const searchdata = req.body.searchdata;

  if (!searchdata || typeof searchdata !== 'string') {
    return res.status(400).send('Invalid search data');
  }

  let browser;
  try {
    if (chromium) {
      browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      browser = await puppeteer.launch();
    }

    const page = await browser.newPage();
    await page.goto('https://simownerdata.pk');
    await page.type('#searchdata', searchdata);
    await page.click('.search-submit');
    await page.waitForSelector('.output-container');

    const response = await page.content();
    const $ = cheerio.load(response);

    const results = [];
    $('.output-container .result-card').each((index, element) => {
      const fullName = $(element).find('.field:nth-child(1) > div').text().trim();
      const phone = $(element).find('.field:nth-child(2) > div').text().trim();
      const cnic = $(element).find('.field:nth-child(3) > div').text().trim();
      const address = $(element).find('.field:nth-child(4) > div').text().trim();

      results.push({ fullName, phone, cnic, address });
    });

    await browser.close();
    res.json(results);
  } catch (error) {
    console.error('Error launching browser:', error);
    if (browser) await browser.close();
    res.status(500).send('Error processing data');
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Node.js server is running on http://localhost:${port}`);
  });
}
