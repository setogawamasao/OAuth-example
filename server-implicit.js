// インプリシットグラントフローの実装
import express from "express";
import { randomUUID } from "crypto";
import { clientId, clientSecret } from "./config-local.js";
const app = express();

app.get("/oauth-start", async function (req, res) {
  // 認可リクエストパラメータ
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const queryObject = {
    response_type: "token",
    client_id: clientId,
    state: randomUUID(),
    scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
    redirect_uri: "http://127.0.0.1:3000/callback",
  };

  // パラメータくみ上げ
  const query = new URLSearchParams(queryObject).toString();
  const authReqUrl = `${baseUrl}?${query}`;
  res.redirect(authReqUrl);
});

app.get("/callback", async function (req, res) {
  console.log("url", req.url); // WEBサーバーにフラグメントは送付されない
  console.log("access token", req.query.access_token);

  res.json(req.url);
});

app.listen(3000, function () {
  console.log("goto http://127.0.0.1:3000/oauth-start ");
});
