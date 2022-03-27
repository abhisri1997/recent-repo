const cheerio = require("cheerio");
const axios = require("axios");

const repos = async (url, apiData, repoNum) => {
  try {
    const reposData = await axios.get(url);
    const $ = cheerio.load(reposData.data);

    $("[itemprop='owns'] > div:nth-child(1)").each((_i, el) => {
      let repoName = $(el).find(".wb-break-all > a").text().trim();
      let repoLink = $(el).find(".wb-break-all > a").attr("href").trim();
      let repoDesc = $(el).find("[itemprop='description']").text().trim();
      apiData.push({
        repoName: repoName,
        repoLink: `https://github.com${repoLink}`,
        repoDesc: repoDesc,
      });
    });
    console.log(apiData.length);
    return repoNum > 0 ? apiData.splice(0, repoNum) : apiData;
  } catch (error) {
    console.error(error);
  }
};
exports.repos = repos;
