#!/bin/bash

BASE_URL="https://jukebox.pattyjog.al"

songs=(
  '{"id":"wrE8OSssx7Nwq6ABKcnaEb","title":"(Nice Dream)","artist":"Radiohead","album":"The Bends","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=e48919ec21b8490fa62ce89dc46dc4be&s=lydi4by1q1&v=1.16.1&c=KtorSearchService&id=wrE8OSssx7Nwq6ABKcnaEb","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=e48919ec21b8490fa62ce89dc46dc4be&s=lydi4by1q1&v=1.16.1&c=KtorSearchService&id=al-606"}'
  '{"id":"mNTfObW4s34ozq3QV664Uy","title":"Anyone Can Play Guitar","artist":"Radiohead","album":"Pablo Honey","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=06dbf915e138f50add502b4757344573&s=v8o49co3gb&v=1.16.1&c=KtorSearchService&id=mNTfObW4s34ozq3QV664Uy","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=06dbf915e138f50add502b4757344573&s=v8o49co3gb&v=1.16.1&c=KtorSearchService&id=al-605"}'
  '{"id":"ch7CfEC0CJmqPeKtlsmA3g","title":"Black Star","artist":"Radiohead","album":"The Bends","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=90481f754fbc08e8e19e1c7a75afbfe1&s=sqt9e72qyc&v=1.16.1&c=KtorSearchService&id=ch7CfEC0CJmqPeKtlsmA3g","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=90481f754fbc08e8e19e1c7a75afbfe1&s=sqt9e72qyc&v=1.16.1&c=KtorSearchService&id=al-606"}'
  '{"id":"wZwtTF4pJdOxB4KwKmWshU","title":"Blow Out","artist":"Radiohead","album":"Pablo Honey","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=10699250ced635cae9ba8c84a90c2e87&s=ihczekujdg&v=1.16.1&c=KtorSearchService&id=wZwtTF4pJdOxB4KwKmWshU","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=10699250ced635cae9ba8c84a90c2e87&s=ihczekujdg&v=1.16.1&c=KtorSearchService&id=al-605"}'
  '{"id":"F85GZWDYjLRwfEbvQ2iR2y","title":"Bones","artist":"Radiohead","album":"The Bends","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=dd1844e935c942c166adf09d9c4fda7d&s=6fe988yk88&v=1.16.1&c=KtorSearchService&id=F85GZWDYjLRwfEbvQ2iR2y","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=dd1844e935c942c166adf09d9c4fda7d&s=6fe988yk88&v=1.16.1&c=KtorSearchService&id=al-606"}'
  '{"id":"pawrlpMsck5MXgifHqPngC","title":"#9 Dream","artist":"John Lennon","album":"Lennon Legend: The Very Best of John Lennon","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=4887b34f917c9c54f26863f806a1a734&s=gd1phfc6o9&v=1.16.1&c=KtorSearchService&id=pawrlpMsck5MXgifHqPngC","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=4887b34f917c9c54f26863f806a1a734&s=gd1phfc6o9&v=1.16.1&c=KtorSearchService&id=al-475"}'
  '{"id":"F6LapIHRVZ66n3S0lJMhmi","title":"(Just Like) Starting Over","artist":"John Lennon","album":"Lennon Legend: The Very Best of John Lennon","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=cd3701e6ca4e260bfda80e1c32df1501&s=0yxdnmpe2c&v=1.16.1&c=KtorSearchService&id=F6LapIHRVZ66n3S0lJMhmi","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=cd3701e6ca4e260bfda80e1c32df1501&s=0yxdnmpe2c&v=1.16.1&c=KtorSearchService&id=al-475"}'
  '{"id":"YckziRAj0f5IlIol4IfCQm","title":"A Day in the Life","artist":"The Beatles","album":"Sgt. Pepper's Lonely Hearts Club Band","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=4fc2394d45b8fb1cb0855eb512f8793d&s=ugb5ktc2ss&v=1.16.1&c=KtorSearchService&id=YckziRAj0f5IlIol4IfCQm","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=4fc2394d45b8fb1cb0855eb512f8793d&s=ugb5ktc2ss&v=1.16.1&c=KtorSearchService&id=al-28"}'
  '{"id":"3ndhZF83vKBmftLfoQEtdF","title":"And Your Bird Can Sing","artist":"The Beatles","album":"Revolver","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=d1375ca5dc078b67cee96001dc1e97da&s=irozxunzc3&v=1.16.1&c=KtorSearchService&id=3ndhZF83vKBmftLfoQEtdF","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=d1375ca5dc078b67cee96001dc1e97da&s=irozxunzc3&v=1.16.1&c=KtorSearchService&id=al-32"}'
  '{"id":"Tt5ypynBvcLg8ATHrDBX8R","title":"Beautiful Boy (Darling Boy)","artist":"John Lennon","album":"Lennon Legend: The Very Best of John Lennon","streamUrl":"https://music.pattyjog.al/rest/stream?u=jukebox&t=730dcedcf5f9aa6487c01f454463c57d&s=9wy6626q45&v=1.16.1&c=KtorSearchService&id=Tt5ypynBvcLg8ATHrDBX8R","coverArtUrl":"https://music.pattyjog.al/rest/getCoverArt?u=jukebox&t=730dcedcf5f9aa6487c01f454463c57d&s=9wy6626q45&v=1.16.1&c=KtorSearchService&id=al-475"}'
)

for song in "${songs[@]}"; do
  echo "Adding song..."
  curl -s -X POST "$BASE_URL/queue/add" \
       -H "Content-Type: application/json" \
       -d "$song"
  echo -e "\n"
done
