const puppeteer = require('puppeteer');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

/**
 * ScraperService handles dynamic website rendering using Puppeteer.
 * It waits for frameworks (React/Vue/etc.) to render before cleaning text.
 */
class ScraperService {
    constructor() {
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        });
    }

    /**
     * Renders a URL in a headless browser and extracts clean text.
     */
    async scrapeUrl(url) {
        let browser;
        try {
            // Smart Protocol Check
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = `https://${url}`;
            }

            console.log(`🔍 Launching Headless Browser for: ${url}`);
            
            // 1. Launch Browser
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            
            // 2. Optimization: Disable images/CSS/Ads to save memory
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // 3. Navigate and WAIT for framework to render (networkidle2)
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            console.log('✅ Page Loaded. Extracting metadata and text...');

            // 4. Extract Data
            const title = await page.title();
            const text = await page.evaluate(() => {
                // Focus on the main content and remove boilerplate
                const scripts = document.querySelectorAll('script, style, nav, footer');
                scripts.forEach(s => s.remove());
                return document.body.innerText.replace(/\s+/g, ' ').trim();
            });

            if (!text || text.length < 50) {
                throw new Error("No readable text found. The site may be heavily protected or empty.");
            }

            const chunks = await this.splitter.splitText(text);
            console.log(`📦 Scraped successfully! Found ${chunks.length} chunks.`);

            return { title, chunks };

        } catch (error) {
            console.error(`❌ Scraper Error: ${error.message}`);
            throw error;
        } finally {
            if (browser) await browser.close();
            console.log('🏁 Browser instance closed.');
        }
    }
}

module.exports = new ScraperService();
