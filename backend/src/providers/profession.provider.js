const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://www.profession.hu";

function buildProfessionSearchUrl(keywords) {
  const normalizedKeywords = String(keywords || "")
    .trim()
    .replace(/\s+/g, "%20");

  return `${BASE_URL}/allasok/1,0,0,${normalizedKeywords}`;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function getProfessionJobId(url) {
  const match = String(url || "").match(/-(\d+)(?:\?|$)/);

  return match ? match[1] : null;
}

async function searchProfessionJobs({ keywords }) {
  if (!keywords || !String(keywords).trim()) {
    throw new Error("A Profession kereséshez kulcsszó szükséges.");
  }

  const url = buildProfessionSearchUrl(keywords);

  const response = await axios.get(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": process.env.PROFESSION_USER_AGENT || "Mozilla/5.0 Joblens/1.0",
    },

    timeout: 20000,
  });

  const $ = cheerio.load(response.data);

  const jobs = [];

  $('h2[aria-label="Munkakör neve"] a[href*="/allas/"]').each((_, element) => {
    const linkElement = $(element);

    const href = linkElement.attr("href");
    const title = normalizeText(linkElement.text());

    if (!href || !title) {
      return;
    }

    const absoluteUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    const externalId = getProfessionJobId(absoluteUrl);

    if (!externalId) {
      return;
    }

    const card = linkElement.closest("article, li, [class*='job-card'], [class*='job-card-item']");

    const location = normalizeText(
      card
        .find(
          '[aria-label="Munkavégzés helye"], [data-testid*="location"]'
        )
        .first()
        .text()
    );

    const companyRaw = normalizeText(
      card
        .find(
          '[aria-label="Hirdető cég"], [data-testid*="company"]'
        )
        .first()
        .text()
    );

    const company = normalizeText(
      companyRaw.replace(location, "")
    );

    // console.log("PROFESSION CARD HTML:");
    // console.log(card.html());

    const description = normalizeText(card.text());

    jobs.push({
      externalId,
      title,
      company: company || null,
      location: location || null,
      description: description || null,
      url: absoluteUrl,
    });
  });

  const uniqueJobs = new Map();

  for (const job of jobs) {
    if (!uniqueJobs.has(job.externalId)) {
      uniqueJobs.set(job.externalId, job);
    }
  }

  return {
    searchUrl: url,
    jobs: [...uniqueJobs.values()],
  };
}

module.exports = {
  searchProfessionJobs,
};