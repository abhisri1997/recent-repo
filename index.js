const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const { children } = require("cheerio/lib/api/traversing");

const PORT = process.env.PORT || 8000;

const app = express();

app.get("/", async (req, res) => {
  try {
    res.redirect("/repos?");
  } catch (error) {
    console.error(error);
    res.redirect("/repos?");
  }
});

app.get("/repos", async (req, res) => {
  try {
    let userName = req.query.user.toString();
    let repoNum = req.query.repo ? req.query.repo.toString() : 0;
    console.log(userName);
    const url = `https://github.com/${userName}?tab=repositories`;
    const apiData = [];
    const fetchData = await repos(url, apiData, repoNum);
    res.json(fetchData);
  } catch (error) {
    console.error(error);
    res.send(`<p>Please use the api in this format:  <a href="${
      req.protocol
    }://${req.get("host")}/user?user_name=name">${req.protocol}://${req.get(
      "host"
    )}/user?user_name=name</a> . Replace name with your github user name.
    </p>`);
  }
});

const repos = async (url, apiData, repoNum) => {
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
    console.log(apiData.length);
    return repoNum > 0 ? apiData.splice(0, repoNum) : apiData;
  } catch (error) {
    console.error(error);
  }
};

app.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
