const express = require("express");
const { children } = require("cheerio/lib/api/traversing");
const { repos } = require("./repos");
const nodeCache = require("node-cache");

const protocol = process.env.HTTPS === "true" ? "https" : "http";
const hostname = process.env.HOSTNAME || "localhost";
const PORT = process.env.PORT || 8000;
const isLocal = hostname === "localhost" ? `:${PORT}` : "";
const myCache = new nodeCache();

const appURL = `${protocol}://${hostname}${isLocal}`;

const app = express();

app.set("json spaces", 2);

app.get("/repos", async (req, res) => {
  try {
    const { user, repo } = req.query;
    user === "" || typeof user === "undefined"
      ? (function () {
          throw "No user name/user parameter provided...";
        })()
      : null;
    const userName = user.toString(); // Sets user queryString to the userName.
    const repoNum = repo ? repo.toString() : 0; // Sets number of repo queryString to the repoNum.
    const url = `https://github.com/${userName}?tab=repositories`; // URL to fetch the users from.
    const apiData = [];
    const cacheKeys = {};

    // Ultimate Caching starts for the API

    if (myCache.has(userName)) {
      parseInt(repoNum) === 0
        ? res.json(myCache.get(userName))
        : res.json(myCache.get(userName).slice(0, repoNum));
      console.log(`Cache working for ${userName}...`);
    } else {
      var fetchData = await repos(url, apiData);
      console.log(fetchData);
      if (
        Array.isArray(fetchData) &&
        fetchData !== "undefined" &&
        fetchData.length > 0
      ) {
        parseInt(repoNum) === 0
          ? res.json(fetchData)
          : res.json(fetchData.slice(0, repoNum));
        myCache.set(userName, fetchData);
      } else {
        throw new Error(`User "${userName}" doesn't exist on GitHub...`);
      }
      console.log(`No cache found for ${userName} getting data from GitHub`);
    }
  } catch (error) {
    console.error(error);
    res.send(`
      <div style="font-family: sans-serif;">
        <p>Please use the api in this format
        <a href="${appURL}/repos?user=name">${appURL}/repos?user=name</a>
        and replace name with your GitHub user name.  
        </p>
        <p>
          Error - <span style="color: red;">${error}</span>
        </p>
      </div>
    `);
  }
});

// Handle all routes other than /repos
app.get("*", async (req, res) => {
  try {
    res.redirect("/repos?");
  } catch (error) {
    console.error(error);
    res.redirect("/repos?");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${appURL}`);
});
