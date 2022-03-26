const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const { children } = require("cheerio/lib/api/traversing");

const PORT = process.env.PORT || 8000;

const app = express();
let userName;

app.get("/user", async (req, res) => {
  userName = req.query.user_name;
  console.log(userName);
  const url = `https://github.com/${userName.toString()}?tab=repositories`;
  const apiData = [];
  const fetchData = await repos(url, apiData);
  res.json(fetchData);
});

const repos = async (url, apiData) => {
  try {
    const reposData = await axios.get(url);
    const $ = cheerio.load(reposData.data);
    const repoDetail = $(".wb-break-all > a");
    const repoDesc = $("p[itemprop]");

    $("[itemprop='owns'] > div:nth-child(1)").each((i, el) => {
      let repoName = $(el).find(".wb-break-all > a").text().trim();
      let repoLink = $(el).find(".wb-break-all > a").attr("href").trim();
      let repoDesc = $(el).find("[itemprop='description']").text().trim();
      apiData.push({
        repoName: repoName,
        repoLink: repoLink,
        repoDesc: repoDesc,
      });
    });
    return apiData;
  } catch (error) {}
};

app.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
