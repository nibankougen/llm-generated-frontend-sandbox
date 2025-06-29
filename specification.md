# 概要
このアプリケーションは投稿ベースのマッチングアプリです。
日常の投稿(Post)をしてそれにいいね(Like)をすることでマッチング候補に入ります。
投稿に相互にいいねが付いたらマッチングが成立します。

# 保存データ
## 投稿について
タイトル(title)と本文(content)、userIdからなります
投稿の削除は投稿をした本人しかできません

## いいねについて
- 投稿した人以外の人は一覧になっている投稿にいいねを付けることができます。
- いいねは投稿ごとに付きます。
- いいねはFirestoreの「likes」コレクションに保存します。
  - ドキュメント構造: { postId: string, userId: string, createdAt: Timestamp }
- 1ユーザーが同じ投稿に複数回いいねすることはできません。
- いいねを取り消す（いいね解除）こともできます。
- 投稿ごとにいいね数を表示します。

## いいねユーザーステータスについて
- 特定のuserにいいねをしたことがあるかは、いいねとは別に「likeUserStatus」コレクションとして保存します。
  - ドキュメント構造: { fromUserId: string, toUserId: string, createdAt: Timestamp }
- いいねした人のuserId（fromUserId）と、いいねされた人のuserId（toUserId）を保存します。
- 1ユーザーが同じ相手に複数回いいねユーザーステータスを作らないようにします。

## マッチングについて
相互にいいねユーザーステータスが付いた状態のユーザー２人をマッチングとして保存します。マッチングは二人のuserIdを保存します。

# 画面について
## トップページ
タイムラインに新着の投稿が流れます。自分の投稿は削除ができます。他人の投稿はいいねができます。
- 投稿ごとに「いいね」ボタンといいね数を表示します。
- いいね済みの場合は「いいね解除」ボタンを表示します。

## ユーザー設定
ユーザー設定画面は自分のユーザーの表示名を編集できます。
ユーザーの表示名は１文字以上のときのみ保存できます。

## マッチング一覧
マッチングしたユーザーの一覧を確認できます。
