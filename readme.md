# 「雰囲気で OAuth2.0 を使っているエンジニアが OAuth2.0 を整理して、手を動かしながら学べる本」のチュートリアルを Express で実装

## Set Up

1. 下記コマンドを実行

```
npm install nodemon
npm install
```

2. google cloud console からクライアントを設定  
   https://console.cloud.google.com/
3. config.js に google cloud API から取得した clientId と clientSecret を設定する。

## 起動

1. 下記コマンドを実行

```
start authorization code
```

2. ブラウザから下記 URL に接続  
   http://127.0.0.1:3000/oauth-start

## OAuth の認可コードフロー + PKCE のシーケンス図

```mermaid
sequenceDiagram
  autonumber
  participant ro as リソースオーナー<br>ブラウザ
  participant cl as クライアント<br>Express
  participant as as 認可<br>Google Cloud API
  participant rs as リソースサーバー<br>Google Picture

  ro->>cl: OAuth開始[http://127.0.0.1:3000/oauth-start]
  Note over cl: stateの文字列生成してセッションに保存<br/>code verifier生成してセッションに保存<br/>code verifierをcode challenge変換
  cl->>+ro: 認可リクエスト(state,code challenge)
  ro->>-as: リダイレクト[https://accounts.google.com/o/oauth2/v2/auth](state,code challenge)
  Note over as: code challengeを保存

  rect rgb(191, 223, 255)
  note right of ro: ユーザー認証処理
  as->>ro: 認証画面
  ro->>as: 認証情報入力
  as->>ro: 権限移譲確認画面
  ro->>as: 委譲の同意
  end

  as->>+ro: 認可レスポンス(認可コード)
  ro->>-cl: リダイレクト[http://127.0.0.1:3000/callback](認可コード,state)
  Note over cl: state検証(クエリvsセッション)<br/>セッションに保存されたcode verifierを取得
  cl->>as: トークンリクエスト[https://www.googleapis.com/oauth2/v4/token](認可コード,state,code verifier)
  Note over as: code verifierとcode challengeを検証
  as->>cl: トークンレスポンス(アクセストークン)
  cl->>rs: リソースリクエスト[https://photoslibrary.googleapis.com/v1/albums](アクセストークン)
  rs->>cl: リソースレスポンス
  cl->>ro: リソース情報

```

## 参考ブログ

1. エクスプレスでセッションの利用  
   https://qiita.com/yuta-katayama-23/items/020169b66d1abe242b37#const-state--generatorsstate
2. PKCE の code_challenge と code_challenge の生成  
   https://yaasita.github.io/2019/04/29/pkce/
3. Express は localhost と 127.0.0.1 を別ドメインとして扱う  
   https://stackoverflow.com/questions/55825921/nodejs-sessionid-is-changing-after-redirect-how-to-keep-user-session-data-per
4. 雰囲気で OAuth2.0 を使っているエンジニアが OAuth2.0 を整理して、手を動かしながら学べる本」  
   https://authya.booth.pm/items/1550861
5. Marmaid 起動(シーケンス図)  
   https://mermaid.js.org/syntax/sequenceDiagram.html
