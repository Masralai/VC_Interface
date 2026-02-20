import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Define the schema for the enrichment data
const EnrichmentSchema = z.object({
    summary: z.string(),
    whatTheyDo: z.array(z.string()),
    keywords: z.array(z.string()),
    derivedSignals: z.array(z.string()),
});

export async function POST(req: NextRequest) {
    try {
        const { url, name } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const firecrawlKey = process.env.FIRECRAWL_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!firecrawlKey || !geminiKey) {
            console.error('Missing API keys');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 1. Initialize Firecrawl and Gemini
        const app = new FirecrawlApp({ apiKey: firecrawlKey });
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 2. Scrape the website with Firecrawl
        console.log(`Scraping ${url} for ${name}...`);
        const scrapeResult = await app.scrape(url, {
            formats: ['markdown'],
        });

        if (!scrapeResult || !scrapeResult.markdown) {
            console.error('Firecrawl failed or returned no markdown:', JSON.stringify(scrapeResult, null, 2));
            throw new Error('Firecrawl failed to extract content from the website');
        }

        const markdown = scrapeResult.markdown;

        // 3. Process with Gemini
        const prompt = `
      You are an expert Venture Capital analyst.
      Analyze the following website content for a company named "${name}" and extract structured intelligence.

      Website Content (Markdown):
      ${markdown.substring(0, 10000)} // Limit context size

      Return a JSON object with the following fields:
      - summary: A 1-2 sentence high-level summary of what they do.
      - whatTheyDo: A list of 3-5 specific bullet points detailing their products/services.
      - keywords: 5-10 relevant industry keywords.
      - derivedSignals: 2-4 signals inferred from the page (e.g., "Active hiring", "Enterprise focused", "Recent product launch").

      Ensure the output is valid JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the markdown-wrapped response if necessary
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        const rawEnrichment = JSON.parse(jsonStr);
        const enrichment = EnrichmentSchema.parse(rawEnrichment);

        return NextResponse.json({
            ...enrichment,
            sources: [
                { url, timestamp: new Date().toISOString() }
            ]
        });

    } catch (error) {
        console.error('Enrichment API error:', error);
        return NextResponse.json({
            error: 'Failed to enrich company',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
