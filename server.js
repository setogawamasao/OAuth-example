import express from "express";
import { clientId, clientSecret } from "./config-local.js";
const app = express();

const server = app.listen(3000, function () {
  console.log("goto http://localhost:3000/oauth-start ");
});

app.get("/oauth-start", async function (req, res, next) {
  // 認可リクエストパラメータ
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const responseType = "code";
  const state = "xyz";
  const scope = "https://www.googleapis.com/auth/photoslibrary.readonly";
  const redirectUri = "http://127.0.0.1:3000/callback";

  // パラメータくみ上げ
  const authReqUrl = `${baseUrl}?response_type=${responseType}&client_id=${clientId}&state=${state}&scope=${scope}&redirect_uri=${redirectUri}`;
  res.redirect(authReqUrl);
});

app.get("/callback", async function (req, res, next) {
  console.log(req.url);
  console.log(req.query.code);

  // トークンリクエストパラメータ
  const tokenRecBaseUrl = "https://www.googleapis.com/oauth2/v4/token";
  const responseType = "code";
  const redirectUri = "http://127.0.0.1:3000/callback";
  const grantType = "authorization_code";
  const code = req.query.code;

  // トークンリクエスト準備
  const bodyObject = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: grantType,
    redirect_uri: redirectUri,
    code: code,
  };
  const body = Object.keys(bodyObject)
    .map((key) => key + "=" + encodeURIComponent(bodyObject[key]))
    .join("&");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
  };
  // トークンリクエスト
  const tokenResponse = await fetch(tokenRecBaseUrl, {
    method: "POST",
    headers,
    body,
  });
  const tokenResData = await tokenResponse.json();
  console.log(tokenResData);

  // リソースリクエスト
  const resourceRecBaseUrl = "https://photoslibrary.googleapis.com/v1/albums";
  const accessToken = tokenResData.access_token;

  const resourceResponse = await fetch(resourceRecBaseUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const resourceData = await resourceResponse.json();
  console.log(resourceData);
  res.json(resourceData);
});
