const express = require("express");
const { children } = require("cheerio/lib/api/traversing");
const { repos } = require("./repos");

const protocol = process.env.HTTPS === "true" ? "https" : "http";
const hostname = process.env.HOSTNAME || "local";
const PORT = process.env.PORT || 8000;

const app = express();

app.set("json spaces", 2);

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
    res.send(`<p>Please use the api in this format:  <a href="${protocol}://${hostname}:${PORT}/repos?user=name">${protocol}://${hostname}:${PORT}/repos?user=name</a> . Replace name with your github user name.
    </p>`);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
