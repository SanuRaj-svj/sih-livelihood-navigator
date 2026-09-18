const mongoose = require('mongoose');
const env = require('../config/env');
const GovernmentScheme = require('../models/GovernmentScheme');

const MYSCHEME_SEARCH_URL = 'https://www.myscheme.gov.in/search';
const PAGE_SIZE = 10;
const MAX_PAGES = Number(process.env.MYSCHEME_MAX_PAGES || 10);

const decodeHtml = (value) => value
  .replace(/&amp;/gi, '&')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&#x27;|&apos;/gi, "'")
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const cleanText = (value) => decodeHtml(value)
  .replace(/\s*\[Image:\s*Image\]\s*/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const extractSchemes = (html) => {
  const schemes = [];
  const pattern = /<a[^>]+href=["'](\/schemes\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const sourcePath = match[1].split('?')[0];
    const slug = sourcePath.split('/').filter(Boolean).pop();
    const name = cleanText(match[2]);
    if (!slug || !name || name.length < 3 || /^(image|view details)$/i.test(name)) continue;

    const start = match.index + match[0].length;
    const following = cleanText(html.slice(start, start + 1800));
    const ministryMatch = following.match(/(?:Ministry|Department|State|Government)[^<]{0,120}/i);
    const description = following.split(/\b(?:Business|Agriculture|Education|Health|Women|Finance|Loan|Scholarship)\b/i)[0].trim();

    schemes.push({
      schemeCode: `MYSCHEME-${slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
      name,
      ministry: ministryMatch ? cleanText(ministryMatch[0]) : '',
      description: description || `Official scheme listing for ${name}. Refer to the MyScheme page for current details.`,
      sourceUrl: `https://www.myscheme.gov.in${sourcePath}`,
    });
  }

  const unique = new Map();
  for (const scheme of schemes) unique.set(scheme.schemeCode, scheme);
  return [...unique.values()];
};

const fetchMySchemePage = async (page) => {
  const url = new URL(MYSCHEME_SEARCH_URL);
  url.searchParams.set('page', String(page));
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html,application/xhtml+xml' },
  });
  if (!response.ok) throw new Error(`MyScheme HTTP ${response.status} on page ${page}`);
  return response.text();
};

const syncMyScheme = async () => {
  const schemes = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const pageSchemes = extractSchemes(await fetchMySchemePage(page));
    schemes.push(...pageSchemes);
    console.log(`Fetched MyScheme page ${page}: ${pageSchemes.length} schemes.`);
    if (pageSchemes.length < PAGE_SIZE) break;
  }

  const unique = new Map(schemes.map((scheme) => [scheme.schemeCode, scheme]));
  if (unique.size === 0) throw new Error('No MyScheme records could be parsed');

  let synced = 0;
  for (const scheme of unique.values()) {
    await GovernmentScheme.findOneAndUpdate(
      { schemeCode: scheme.schemeCode },
      {
        $set: {
          name: scheme.name,
          ministry: scheme.ministry,
          description: scheme.description,
          sourceUrl: scheme.sourceUrl,
          sourceUpdatedAt: new Date(),
          status: 'ACTIVE',
        },
        $setOnInsert: {
          schemeCode: scheme.schemeCode,
          beneficiaryGroups: [],
          eligibility: [],
          benefits: [],
          sectors: [],
          applicationUrl: scheme.sourceUrl,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    synced += 1;
  }

  console.log(`Synced ${synced} live MyScheme records.`);
  console.log(`Source: ${MYSCHEME_SEARCH_URL} (pages: ${MAX_PAGES})`);
};

const run = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    await syncMyScheme();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync MyScheme records:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
