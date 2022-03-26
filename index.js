const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const { children } = require("cheerio/lib/api/traversing");

const PORT = process.env.PORT || 8000;

const app = express();
let userName;

app.get("/user", async (req, res) => {
  userName = req.query.user_name.toString();
  console.log(userName);
  const url = `https://github.com/${userName}?tab=repositories`;
  const apiData = [];
  const fetchData = await repos(url, apiData);
  res.json(fetchData);
  // apiData.splice(0, apiData.length);
});

const repos = async (url, apiData) => {
  try {
    const reposData = await axios.get(url);
    const $ = cheerio.load(reposData.data);
    const repoDetail = $(".wb-break-all > a");
    const repoDesc = $("p[itemprop]");
    repoDetail.each((index, element) => {
      let repoName = $(element).text().trim();
      let repoURL = `https://github.com${$(element).attr("href")}`;
      apiData.push({
        repoName: repoName,
        repoLink: repoURL,
      });
    });
    repoDesc.each((index, element) => {
      apiData[index].desc = $(element).text().trim();
    });
    // console.log(apiData);
    return apiData;
  } catch (error) {}
};

app.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
