// 認可コードフロー＋PKCEの実装
import express from "express";
import session from "express-session";
import { randomUUID } from "crypto";
import base64url from "base64url";
import sha256 from "js-sha256";
import { clientId, clientSecret } from "./config-local.js";
const app = express();

app.use(
  session({
    secret: "session secret",
    cookie: { maxAge: 10 * 1000 },
  })
);

app.get("/oauth-start", async function (req, res) {
  // 認可リクエストパラメータ
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const codeVerifier = getCodeVerifier();
  const codeChallenge = getCodeChallenge(codeVerifier);
  const queryObject = {
    response_type: "code",
    client_id: clientId,
    state: randomUUID(),
    scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
    redirect_uri: "http://127.0.0.1:3000/callback",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  };

  // セッションに保存
  req.session.state = queryObject.state;
  req.session.codeVerifier = codeVerifier;
  console.log(req.session);
  console.log(req.session.id);

  // パラメータくみ上げ
  const query = new URLSearchParams(queryObject).toString();
  const authReqUrl = `${baseUrl}?${query}`;
  res.redirect(authReqUrl);
});

app.get("/callback", async function (req, res) {
  console.log(req.url);
  console.log(req.session);
  console.log(req.session.id);

  // stateの検証
  if (req.query.state !== req.session.state) throw new Error("Invalid state.");

  // トークンリクエストパラメータ
  const tokenRecBaseUrl = "https://www.googleapis.com/oauth2/v4/token";
  const bodyObject = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: "http://127.0.0.1:3000/callback",
    code: req.query.code,
    code_verifier: req.session.codeVerifier,
  };
  const body = new URLSearchParams(bodyObject).toString();
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

app.listen(3000, function () {
  console.log("goto http://127.0.0.1:3000/oauth-start ");
});

const getCodeVerifier = () => {
  let buf = Buffer.alloc(32);
  for (let i = 0; i < buf.length; i++) {
    const random_num = Math.floor(Math.random() * 256);
    buf.writeUInt8(random_num, i);
  }
  return base64url(buf);
};

const getCodeChallenge = (str) => {
  const hash = sha256.arrayBuffer(str);
  return base64url(hash);
};
