const express = require("express");
const { children } = require("cheerio/lib/api/traversing");
const { repos } = require("./repos");

const protocol = process.env.HTTPS === "true" ? "https" : "http";
const hostname = process.env.HOSTNAME || "localhost";
const PORT = process.env.PORT || 8000;
const isLocal = hostname === "localhost" ? `:${PORT}` : "";

const appURL = `${protocol}://${hostname}${isLocal}`;

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
    req.query.user === "" || typeof req.query.user === "undefined"
      ? (function () {
          throw "No user name/user parameter provided...";
        })()
      : null;
    let userName = req.query.user.toString();
    let repoNum = req.query.repo ? req.query.repo.toString() : 0;
    const url = `https://github.com/${userName}?tab=repositories`;
    const apiData = [];
    const fetchData = await repos(url, apiData, repoNum);
    res.json(fetchData);
  } catch (error) {
    console.error(error);
    res.send(`
      <div style="font-family: sans-serif;">
        <p>Please use the api in this format
        <a href="${appURL}/repos?user=name">${appURL}/repos?user=name</a>
        and replace name with your github user name.  
        </p>
        <p>
          Error - <span style="color: red;">${error}</span>
        </p>
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${appURL}`);
});
