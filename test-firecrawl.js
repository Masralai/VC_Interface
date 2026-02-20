const FirecrawlApp = require('@mendable/firecrawl-js').default;
require('dotenv').config();

const apiKey = "fc-fa7464c8356445ed8c4e8915707212eb";
const app = new FirecrawlApp({ apiKey });

async function test() {
  console.log("Testing Firecrawl with key:", apiKey.substring(0, 10) + "...");
  try {
    const res = await app.scrape("https://example.com", { formats: ['markdown'] });
    console.log("Response:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Catch error:", e);
  }
}

test();
