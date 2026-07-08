/*
  Vercel serverless route
  -----------------------
  Creator: crazywaffleguy
  GitHub:  https://github.com/crazywaffleguy
  Linktree: https://linktr.ee/crazywaffleguy

  Deployed URL: /api/daily?mode=normal or /api/daily?mode=cubed
*/

const { dailyPuzzle } = require("../src/daily");

module.exports = function handler(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const mode = url.searchParams.get("mode") || "normal";

  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
  response.statusCode = 200;
  response.end(JSON.stringify(dailyPuzzle(mode)));
};
