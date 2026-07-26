const axios = require("axios");

const apiKey = process.env.CAREERJET_API_KEY;
const apiUrl = process.env.CAREERJET_API_URL || "https://search.api.careerjet.net/v4/query";
const defaultLocale = process.env.CAREERJET_LOCALE || "hu_HU";

function assertConfiguretion() {
  if (!apiKey) {
    throw new Error("A CAREERJET_API_KEY nincs beállítva.")
  }
}

async function searchCareerjetJobs({
  keywords,
  location,
  page = 1,
  pageSize = 20,
  userIp,
  userAgent,
}) {
  assertConfiguretion();

  if (!userIp) {
    throw new Error("A Careerjet lekérdezéshez user_ip szükséges.");
  }

  if (!userAgent) {
    throw new Error("A Careerjet lekérdezéshez user_agent szükséges.");
  }

  const response = await axios.get(apiUrl, {
    auth: {
      username: apiKey,
      password: "",
    },

    params: {
      locale_code: defaultLocale,
      keywords,
      location,
      page,
      page_size: pageSize,
      user_ip: userIp,
      sort: "date", 
      fragment_size: 50000,
      user_agent: userAgent,
    },

    timeout: 20000,

    headers: {
      Accept: "application/json",
      Referer: process.env.CAREERJET_REFERER || "https://job-lens-virid.vercel.app/",
    },
  });

  return response.data;
}

module.exports = {
  searchCareerjetJobs,
};