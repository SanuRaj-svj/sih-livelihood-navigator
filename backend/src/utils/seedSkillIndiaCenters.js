const mongoose = require('mongoose');
const env = require('../config/env');
const TrainingCenter = require('../models/TrainingCenter');

const SKILL_INDIA_URL = 'https://www.skillindiadigital.gov.in/training-centres';
const PAGE_SIZE = 18;
const MAX_PAGES = 100;

const decodeHtml = (value) => value
  .replace(/&amp;/gi, '&')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&#x27;|&apos;/gi, "'")
  .replace(/&ldquo;|&rdquo;/gi, '"')
  .replace(/&ndash;|&mdash;/gi, '-')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeName = (value) => decodeHtml(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const htmlLines = (value) => value
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '\n')
  .replace(/&amp;/gi, '&')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&#x27;|&apos;/gi, "'")
  .replace(/&ldquo;|&rdquo;/gi, '"')
  .replace(/&ndash;|&mdash;/gi, '-')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .split(/\n+/)
  .map((line) => line.trim())
  .filter(Boolean);

const extractCenters = (html) => {
  const centers = [];
  const blocks = [...html.matchAll(/<h[3-5][^>]*>([\s\S]*?)<\/h[3-5]>([\s\S]*?)(?=<h[3-5][^>]*>|$)/gi)];

  for (const [, heading, content] of blocks) {
    const name = decodeHtml(heading);
    const blockText = `${heading}\n${content}`;
    const email = blockText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
    const phone = blockText.match(/(?:\+?91[\s-]?)?[6-9]\d{9}\b/)?.[0]?.replace(/[\s-]/g, '') || '';
    const lines = htmlLines(blockText).filter((line) => (
      line !== name
      && !/view details|skill centre|image|mailme/i.test(line)
      && !line.includes('@')
      && !/[6-9]\d{9}/.test(line)
    ));

    if (!email && !phone) continue;
    if (!name || name.length < 3) continue;

    centers.push({
      name,
      address: lines.slice(0, 2).join(', '),
      contactInfo: { email, phone },
    });
  }

  const unique = new Map();
  for (const center of centers) unique.set(normalizeName(center.name), center);
  return [...unique.values()];
};

const fetchSkillIndiaCenters = async () => {
  const centers = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(SKILL_INDIA_URL);
    url.searchParams.set('PageNumber', String(page));
    url.searchParams.set('PageSize', String(PAGE_SIZE));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) throw new Error(`Skill India HTTP ${response.status} on page ${page}`);

    const pageCenters = extractCenters(await response.text());
    centers.push(...pageCenters);
    console.log(`Fetched Skill India page ${page}: ${pageCenters.length} centres.`);

    if (pageCenters.length < PAGE_SIZE) break;
  }

  const unique = new Map();
  for (const center of centers) unique.set(normalizeName(center.name), center);
  if (unique.size === 0) {
    throw new Error('Skill India page is not exposing parseable centre records; the live source may be client-rendered or temporarily unavailable.');
  }
  return [...unique.values()];
};

const syncSkillIndiaCenters = async () => {
  let liveCenters;
  try {
    liveCenters = await fetchSkillIndiaCenters();
  } catch (error) {
    const existingCenters = await TrainingCenter.find({}).lean();
    console.warn('Skill India live sync skipped; keeping existing centre data:', error.message);
    return existingCenters.length;
  }

  const existingCenters = await TrainingCenter.find({}).lean();
  const existingByName = new Map(existingCenters.map((center) => [normalizeName(center.name), center]));

  const documents = liveCenters.map((center) => {
    const existing = existingByName.get(normalizeName(center.name));
    return {
      name: center.name,
      address: center.address || existing?.address || 'Address not published by Skill India Digital',
      location: existing?.location || { type: 'Point', coordinates: [0, 0] },
      coursesOffered: existing?.coursesOffered || [],
      capacity: existing?.capacity || 0,
      contactInfo: {
        phone: center.contactInfo.phone || existing?.contactInfo?.phone || '',
        email: center.contactInfo.email || existing?.contactInfo?.email || '',
      },
    };
  });

  await TrainingCenter.deleteMany({});
  const inserted = await TrainingCenter.insertMany(documents);
  console.log(`Synced ${inserted.length} live Skill India training centres.`);
  console.log('Source:', SKILL_INDIA_URL);
  return inserted.length;
};

const seedSkillIndiaCenters = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    await syncSkillIndiaCenters();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed Skill India training centres:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) seedSkillIndiaCenters();

module.exports = { syncSkillIndiaCenters };
