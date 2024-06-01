const express = require("express");
const app = express();

const server = app.listen(3000, function () {
  console.log("listening port is " + server.address().port);
});

app.get("/oauth-start", function (req, res, next) {
  res.json("HELLO EXPRESS");
});
