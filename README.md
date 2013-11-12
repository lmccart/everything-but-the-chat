everything-but-the-chat
=======================

This combines:

+ [github.com/auduno/clmtrackr](https://github.com/auduno/clmtrackr) - precise tracking of facial features via Constrained Local Models
+ [github.com/yyx990803/Speech.js](https://github.com/yyx990803/Speech.js) - wrapper for chrome web speech recognition API
+ [peerjs.com](http://peerjs.com) - wrapper for WebRTC p2p data and video calls


#### Video call
The WebRTC video call and data connection are built on top of [peerjs.com](http://peerjs.com). There is a temporary API key in the code, but you should [register for your own](http://peerjs.com/peerserver) and replace it in this line in chat.js.

```javascript
var peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3, config: {'iceServers': [
  { url: 'stun:stun.l.google.com:19302' } // Pass in optional STUN and TURN server for maximum network compatibility
]}});
``` 

#### Send data

The data connection is opened automatically when you start a video call. You can send data with ```connection.send("some-string")```, this block in chat.js demonstrates doing this on button click.

```javascript
// Send message over data connection
$('#send-data').click(function(){
  var msg = $('#data-msg').val();
  //console.log("sent ");
  connection.send(msg);
});
```


#### Chrome speech API

This app uses a wrapper around the Chrome speech API. More documentation here: [github.com/yyx990803/Speech.js](https://github.com/yyx990803/Speech.js).

You start it with ```startSpeech()```, this block in chat.js demonstrates doing this on button click.

```javascript
// Start speech
$('#start-speech').click(function(){
  console.log("starting speech");
  startSpeech();
  $('#start-speech').hide();
});
```

You can change some of the settings for speech detection in this block. See the speech.js repo for more options.

```javascript
var speech = new Speech({
    // lang: 'cmn-Hans-CN', // Mandarin Chinese, default is English.
    // all boolean options default to false
    debugging: false, // true, - will console.log all results
    continuous: true, // will not stop after one sentence
    interimResults: true, // trigger events on iterim results
    autoRestart: true, // recommended when using continuous:true
                      // because the API sometimes stops itself
                      // possibly due to network error.
});
```

#### CLM face tracking

This app uses [github.com/auduno/clmtrackr](https://github.com/auduno/clmtrackr) to draw the face tracking data outline overlay. You can dig further into the clmtracker repo for more information on getting other data from the tracker object.


You start it with ```startTracking();```, this block in chat.js demonstrates doing this on button click.

```javascript
// Start facetracking
$('#start-tracking').click(function(){
  console.log("starting tracking");
  startTracking();
  $('#start-tracking').hide();
});
```

