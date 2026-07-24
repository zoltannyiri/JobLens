const axios = require("axios");

const apiKey = process.env.JOOBLE_API_KEY;
const apiUrl = process.env.JOOBLE_API_URL || "https://jooble.org/api";

function assertConfiguretion() {
  if (!apiKey) {
    throw new Error("A JOOBLE_API_KEY nincs beállítva.")
  }
}

async function searchJoobleJobs({
  keywords,
  location,
  page = 1,
  resultOnPage = 20,
}) {
  assertConfiguretion();

  const response = await axios.post(
    `${apiUrl}/${apiKey}`,
    {
      keywords,
      location,
      page,
      ResultOnPage: resultOnPage,
      SearchMode: 1,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  
  console.log("Jooble request:", {
    keywords,
    location,
    page: String(page),
    ResultOnPage: String(resultOnPage),
  });

  console.log(
    "Jooble response:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
}

module.exports = {
  searchJoobleJobs,
};