

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// Connection object;
var connection;
// Speech object
var speech;


// UI Peer helper methods
function step1 () {
  // Get audio/video stream
  navigator.getUserMedia({audio: true, video: true}, function(stream){
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));

    window.localStream = stream;
    
    $('#step1, #step3').hide();
    $('#step2').show();
  }, function(){ $('#step1-error').show(); });
}


function receiveCall(call) {
  // Hang up on an existing call if present
  if (window.existingCall) {
    window.existingCall.close();
  }

  console.log('received');
  // Wait for stream on the call, then set peer video display
  call.on('stream', function(stream){
    $('#their-video').prop('src', URL.createObjectURL(stream));
  });

  // UI stuff
  window.existingCall = call;
  $('#their-id').text(call.peer);
  call.on('close', step2);
  $('#step1, #step2').hide();
  $('#step3').show();
}


// PeerJS object
// Insert your own key here!
var peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3, config: {'iceServers': [
  { url: 'stun:stun.l.google.com:19302' } // Pass in optional STUN and TURN server for maximum network compatibility
]}});

peer.on('open', function(){
  $('#my-id').text(peer.id);
});

// Receiving a call
peer.on('call', function(call){
  // Answer the call automatically (instead of prompting user) for demo purposes
  call.answer(window.localStream);
  receiveCall(call);
});

// Receiving a data connection
peer.on('connection', function(conn) { 
  connection = conn;
  attachConnListeners();
});

peer.on('error', function(err){
  alert(err.message);
  // Return to step 2 if error occurs
});

function attachConnListeners() {
  connection.on('open', function() {
    console.log("CONNECTION OPENEED");
    // Receive messages
    connection.on('data', function(data) {
      console.log('Received', data);
    });

    // Send messages
    connection.send('Hello!');
  });
}

// Button cick handlers setup
$(function(){
  $('#make-call').click(function(){
    // Initiate a call!
    var id = $('#callto-id').val();
    var call = peer.call(id, window.localStream);
    connection = peer.connect(id);
    attachConnListeners();
    receiveCall(call);
  });

  $('#end-call').click(function(){
    window.existingCall.close();
  });

  // Retry if getUserMedia fails
  $('#step1-retry').click(function(){
    $('#step1-error').hide();
    step1();
  });

  // Send message over data connection
  $('#send-data').click(function(){
    var msg = $('#data-msg').val();
    //console.log("sent ");
    connection.send(msg);
  });


  // Start speech
  $('#start-speech').click(function(){
    console.log("starting speech");
    startSpeech();
    $('#start-speech').hide();
    $('#start-liwc').show();
  });

  // Start liwc
  $('#start-liwc').click(function(){
    console.log("starting liwc");
    if (speech) speech.options.liwc = true;
    $('#start-liwc').hide();
  });

  // Start facetracking
  $('#start-tracking').click(function(){
    console.log("starting tracking");
    startTracking();
    $('#start-tracking').hide();
  });

  // Get things started
  step1();
});




// Chrome speech to text
// See github.com/yyx990803/Speech.js for more.
function startSpeech() {

  speech = new Speech({
      // lang: 'cmn-Hans-CN', // Mandarin Chinese, default is English.
      // all boolean options default to false
      debugging: false, // true, - will console.log all results
      continuous: true, // will not stop after one sentence
      interimResults: true, // trigger events on iterim results
      autoRestart: true, // recommended when using continuous:true
                        // because the API sometimes stops itself
                        // possibly due to network error.
  });

  // simply listen to events
  // chainable API
  speech
      .on('start', function () {
          console.log('started')
      })
      .on('end', function () {
          console.log('ended')
      })
      .on('error', function (event) {
          console.log(event.error)
      })
      .on('interimResult', function (msg) {
      })
      .on('finalResult', function (msg) {
        // if (connection) connection.send(msg);
        console.log("sent: " + msg);
        console.log(speech.parser.curStats);
      })
      .start()
}


// CLM Facetracking 
// See github.com/auduno/clmtrackr for more.

function startTracking() {

  var vid = document.getElementById('my-video');
  var overlay = document.getElementById('overlay');
  var overlayCC = overlay.getContext('2d');
  
  var ctrack = new clm.tracker({useWebGL : true});
  ctrack.init(pModel);

  startVideo();

  function startVideo() {

    // start video
    vid.play();
    // start tracking
    ctrack.start(vid);
    // start loop to draw face
    drawLoop();
  }
  
  function drawLoop() {
    requestAnimationFrame(drawLoop);
    overlayCC.clearRect(0, 0, overlay.width, overlay.height);
    //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
    if (ctrack.getCurrentPosition()) {
      // var positions = ctrack.getCurrentPosition();
      // positions[0][0], positions[0][1] --  x and y of first point https://github.com/auduno/clmtrackr
      ctrack.draw(overlay);
    }
  }
}


