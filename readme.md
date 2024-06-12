# 「雰囲気で OAuth2.0 を使っているエンジニアが OAuth2.0 を整理して、手を動かしながら学べる本」のチュートリアルを Express で実装

## 概要

雰囲気で OAuth2.0 を使っているエンジニアが OAuth2.0 を整理して、手を動かしながら学べる本」のチュートリアル 6 章のチュートリアルは Curl で実行されていますが、
パラメーターのコピペがめんどくさいので、Node.js の Express を使って実装しました。OAuth の詳細な説明は省きます(本を買って下さい)。
PKCE と state も実装しています。OAuth に関する実装はなるべく専用パッケージは使わずに、基本的なパッケージ(セッション、ハッシュ、URL エンコード、乱数の生成など)のみで実装しました。
学習用に作成したものなので、本番に使うことはお勧めしません。

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

## ロール

### リソースオーナー

### クライアント

#### パブリッククライアント

#### コンフィデンシャルクライアント

### 認可サーバー

### リソースサーバー

## 各エンドポイントとパラメーター

## OAuth の認可コードフローに対する攻撃

### 認可コード横取り攻撃

PKCE という対策手法により防ぐことができる。
PKCE(Proof Key for Code Exchange)は認可コードリクエストしたセッションとトークンリクエストしたセッションが同じかどうか認可サーバーで検証する仕組みです。  
認可リクエストを受けた時にクライアントで code_verifier を生成し code_challenge に変換します。  
code_verifier はセッションに保存して、code_challenge はリダイレクト URL のクエリパラメータに設定します。  
code_challenge は認可サーバーにリダイレクトされた際に、認可サーバー側に保存されます。
認可サーバーからの認可レスポンスのリダイレクトをクライアントで受けとった際に、セッションに保存した code_verifier を取得して、アクセストークンのリクエスト時に付与します。
認可サーバーで保存した code_challenge と code_verifier を検証し、OK であれば、クライアントにアクセストークンを返します。

### CSRF 攻撃

state と前述の PKCE どちらでも対策可能。ただし攻撃の発見のタイミングが異なる。
PKCE はトークンリクエストの際に認可サーバーで攻撃の発見が可能だが、state はトークンリクエストを送る前にクライアントで発見することができる。

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
