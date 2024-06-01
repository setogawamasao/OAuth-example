const express = require("express");
const app = express();

const server = app.listen(3000, function () {
  console.log("goto http://localhost:3000/oauth-start ");
});

app.get("/oauth-start", async function (req, res, next) {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await response.json();
  res.json(data);
});
