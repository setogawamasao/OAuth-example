# 「雰囲気で OAuth2.0 を使っているエンジニアが OAuth2.0 を整理して、手を動かしながら学べる本」のチュートリアルを Express で実装

### 「雰囲気で OAuth2.0 を使っているエンジニアが OAuth2.0 を整理して、手を動かしながら学べる本」

https://authya.booth.pm/items/1550861

### google cloud console

https://console.cloud.google.com/

### express は localhost と 127.0.0.1 を別ドメインとして扱う

https://stackoverflow.com/questions/55825921/nodejs-sessionid-is-changing-after-redirect-how-to-keep-user-session-data-per

### 参考

https://qiita.com/yuta-katayama-23/items/020169b66d1abe242b37#const-state--generatorsstate

https://yaasita.github.io/2019/04/29/pkce/

### OAuth の認可コードフローのシーケンス図

```mermaid
sequenceDiagram
  participant User
  participant Client
  participant AuthorizationServer
  participant ResourceServer

  User->Client: 1. リクエストを送信
  Client->AuthorizationServer: 2. 認可リクエストを送信
  AuthorizationServer->User: 3. ユーザーに認可を求める
  User->AuthorizationServer: 4. 認可を与える
  AuthorizationServer->Client: 5. 認可コードを返す
  Client->AuthorizationServer: 6. アクセストークンを要求
  AuthorizationServer->Client: 7. アクセストークンを返す
  Client->ResourceServer: 8. リソースを要求
  ResourceServer-->Client: 9. リソースを返す
```
