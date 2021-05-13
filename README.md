# sp-app
 
The Springcast app is a React Native Expo app which will be exported to both Android and iOS apps. The user should already have registered for an account on the Springcast.fm platform. All authentication should be done through the Springcast.fm API. The user should login with e-mail address and password. On first login the user should reset the password. When the user is signed in successfully the app will receive a JSON object from the Springcast server. This object has data for shows and episodes. These shows are loaded on the first page on the app. When a show is selected the corresponding episodes are displayed. When an episode is selected it can be played or downloaded to be played offline.

Example of JSON object (https://adyen.thomasjacobs.dev/app.json):

```json
[
   {
      "id":1,
      "title":"Show #1 title",
      "artwork":"file.png",
      "episodes":[
         {
            "id":271,
            "podcast_id":1,
            "title":"#1 Amanj Hamid over helemaal opnieuw beginnen met nog veel meer tekst er achter voor ene lange title",
            "description":"<p><span style=\"font-weight: 400\">In de allereerste aflevering van de Growth Minds podcast spraken we met Amanj Hamid over zijn reis, of beter gezegd vlucht, vanuit Irak en hoe hij een compleet nieuw leven opbouwde in een land waar hij niemand kende.<\/span>\r\n\r\n<span style=\"font-weight: 400\">Amanj is voor ons geen onbekende en toen we nadachten over wat voor soort gasten er in de Growth Minds podcast moesten aanschuiven, stond Amanj direct op onze lijst.&nbsp;<\/span>\r\n\r\n<span style=\"font-weight: 400\">Want Amanj heeft menig obstakel moeten overwinnen in zijn leven en heeft intensief moeten groeien om te komen waar hij nu staat.&nbsp;<\/span>\r\n\r\n",
            "audio_file":"audio\/2\/243\/271\/Vjfvwjzug9Mj1ptPv9DSXRKA7Ixup2Wx3TqoQL8s.mp3",
            "audio_file_original_name":"e1f5e0a4d6555477d0acd2f0f29378d5.mp3",
            "artwork":"https://app.springcast.fm/storage/artwork/2/243/271/dF01NLtVw89opH3z22oJWcmM8Eij4G6dDawtcRAD.png",
            "artwork_original_name":"Amanj-Hamid-podcast-tumb.png",
            "duration":"3694.03",
            "audio_size":"119964096"
         },
         {
            "id":1679,
            "podcast_id":1,
            "title":"#0 - De Growth Minds trailer",
            "description":"De Growth Minds podcast is dé Nederlandse podcast op het gebied van persoonlijke ontwikkeling, succes en ondernemerschap. Samen met co-host Majella gaat Business coach Nico in gesprek met mensen die iets bijzonders hebben gepresteerd en die hun learnings willen delen.",
            "audio_file":"audio\/2\/243\/1679\/XFaOhTkEJm3dvtuqmVD1oRtdUlwZUIoXKIggZ9Rl.mp3",
            "audio_file_original_name":"67022d195cd36b055e6cde6d639a21a6.mp3",
            "artwork":"https://app.springcast.fm/storage/artwork/2/243/1679/vm8u6KtOl0lHAGouyE615hlG7rnqgGAjYXvR5nlo.png",
            "artwork_original_name":"153e53a8785de5dc6e0b9330c98b7719.png",
            "duration":"90.72",
            "audio_size":"1455669"
         }
      ]
   },
   {
      "id":2,
      "title":"Show #2 title",
      "artwork":"file_2.png",
      "episodes":[
         {
            "id":25,
            "podcast_id":2,
            "title":"#1 Amanj Hamid over helemaal opnieuw beginnen met nog veel meer tekst er achter voor ene lange title",
            "description":"<p><span style=\"font-weight: 400\">In de allereerste aflevering van de Growth Minds podcast spraken we met Amanj Hamid over zijn reis, of beter gezegd vlucht, vanuit Irak en hoe hij een compleet nieuw leven opbouwde in een land waar hij niemand kende.<\/span>\r\n\r\n<span style=\"font-weight: 400\">Amanj is voor ons geen onbekende en toen we nadachten over wat voor soort gasten er in de Growth Minds podcast moesten aanschuiven, stond Amanj direct op onze lijst.&nbsp;<\/span>\r\n\r\n<span style=\"font-weight: 400\">Want Amanj heeft menig obstakel moeten overwinnen in zijn leven en heeft intensief moeten groeien om te komen waar hij nu staat.&nbsp;<\/span>\r\n\r\n",
            "audio_file":"audio\/2\/243\/271\/Vjfvwjzug9Mj1ptPv9DSXRKA7Ixup2Wx3TqoQL8s.mp3",
            "audio_file_original_name":"e1f5e0a4d6555477d0acd2f0f29378d5.mp3",
            "artwork":"https://app.springcast.fm/storage/artwork/2/243/271/dF01NLtVw89opH3z22oJWcmM8Eij4G6dDawtcRAD.png",
            "artwork_original_name":"Amanj-Hamid-podcast-tumb.png",
            "duration":"3694.03",
            "audio_size":"119964096"
         },
         {
            "id":28,
            "podcast_id":2,
            "title":"#0 - De Growth Minds trailer",
            "description":"De Growth Minds podcast is dé Nederlandse podcast op het gebied van persoonlijke ontwikkeling, succes en ondernemerschap. Samen met co-host Majella gaat Business coach Nico in gesprek met mensen die iets bijzonders hebben gepresteerd en die hun learnings willen delen.",
            "audio_file":"audio\/2\/243\/1679\/XFaOhTkEJm3dvtuqmVD1oRtdUlwZUIoXKIggZ9Rl.mp3",
            "audio_file_original_name":"67022d195cd36b055e6cde6d639a21a6.mp3",
            "artwork":"https://app.springcast.fm/storage/artwork/2/243/1679/vm8u6KtOl0lHAGouyE615hlG7rnqgGAjYXvR5nlo.png",
            "artwork_original_name":"153e53a8785de5dc6e0b9330c98b7719.png",
            "duration":"90.72",
            "audio_size":"1455669"
         }
      ]
   }
]      
```
