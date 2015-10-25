var final_transcript = '';
var interim_transcript = '';
var recognizing = false;
var ignore_onend;
var magic_word = 'educate';

window.open(chrome.extension.getURL("permission.html"));


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
  };
  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
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
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
  };
  recognition.onresult = function(event) {
    //console.log('got result');
    interim_transcript = '';
    var trans = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      var t = event.results[i][0].transcript;
      console.log(i+': '+t);
      if (event.results[i].isFinal) {
        trans += t;
      } else {
        interim_transcript += t;
      }
    }
    addFinalTranscript(trans);

    final_transcript = capitalize(final_transcript);
    
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
  showInfo('info_allow');
}
function showInfo(s) {
  if (s) {
    console.log(s);
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
    if(words[i].toLowerCase() === magic_word) {
      
      words = words.slice(i);
      //words.push(';\n');
      final_transcript += words.join(' ');
      handle({
        target: words[0],
        command: words.slice(1)
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

  switch(true) {
    case /^search/.test(request.command):
      console.log(request);
      
      var msg = new SpeechSynthesisUtterance('searching '+ 
          request.command.slice(1).join(' '));
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);

      window.open('https://www.google.com/#q='+
          request.command.slice(1).join('+'));
      break;
    case /^open/.test(request.command):
      console.log(request);

      break;
    case /^press/.test(request.command):
      var page_up = 33;
      var page_down = 34;
      if(request.command.slice(1).join(' ') === 'page up') {
        console.log("press page up");
        press(page_up);
      } else if(request.command.slice(1).join(' ' === 'page down')) {
        console.log("press page down");
        press(page_down);
      }
      
      break;
      //...
    default:
      break;
  }
}

function press(keycode) {
  $(function() {
      var e = $.Event('keypress');
      e.which = keycode; // Character 'A'
      $('document').trigger(e);
  });
}

startButton(null);

