

var final_transcript = '';
var interim_transcript = '';
var recognizing = false;
var ignore_onend;

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  //start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    start_img.src = 'mic-animate.gif';
  };
  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      showInfo('info_blocked/denied');
      ignore_onend = true;
    }
  };
  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = 'mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };
  recognition.onresult = function(event) {
    interim_transcript = '';
    var trans = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      var t = event.results[i][0].transcript;
      //console.log(i+': '+t);
      if (event.results[i].isFinal) {
        trans += t;
      } else {
        interim_transcript += t;
      }
    }
    addFinalTranscript(trans);

    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}
function upgrade() {
  //start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = 'en-US';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = 'mic-slash.gif';
  showInfo('info_allow');
  showButtons('none');
}
function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}
var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
}

function speak(){
  //create start command ok start

  var msg = new SpeechSynthesisUtterance(final_transcript + " " + interim_transcript);
  console.log(final_transcript);
   
	if (final_transcript === "Open"){
		window.open("http://www.google.com");
	} else {
		console.log("Does not work");
	}

}

function addFinalTranscript(t) {
  var words = t.split(' ');
  for(var i = 0; i<words.length; i++) {
    //console.log('checking '+words[i]);
    if(words[i].toLowerCase() === 'google') {
      
      words = words.slice(i);
      //words.push(';\n');
      final_transcript += words.join(' ');
      handle({
        target: words[0],
        command: words[1],
        parameters: words.slice(2)
      });
      //console.log("> "+final_transcript);
      break;
    }
  }

}

var requests = [];
function handle(request) {
  if(!request) return;

  requests.push(request);

  switch(request.command) {
    case "search":
      console.log(request);
      break;
    case "open":
      console.log(request);
      break;
      //...
    default:
      break;
  }
}

startButton(null);

