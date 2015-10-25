var final_transcript = '';
var interim_transcript = '';
var recognizing = false;
var ignore_onend;
var magic_word = 'educate';
var recognition = null;
var requests = [];
var story = "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?' So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her. There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.";


//ref: http://andrew.hedges.name/experiments/levenshtein/levenshtein.js
var levenshteinenator = (function () {

  /**
   * @param String a
   * @param String b
   * @return Array
   */
  function levenshteinenator(a, b) {
    var cost;
    var m = a.length;
    var n = b.length;

    // make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
    if (m < n) {
      var c = a; a = b; b = c;
      var o = m; m = n; n = o;
    }

    var r = []; r[0] = [];
    for (var c = 0; c < n + 1; ++c) {
      r[0][c] = c;
    }

    for (var i = 1; i < m + 1; ++i) {
      r[i] = []; r[i][0] = i;
      for ( var j = 1; j < n + 1; ++j ) {
        cost = a.charAt( i - 1 ) === b.charAt( j - 1 ) ? 0 : 1;
        r[i][j] = minimator( r[i-1][j] + 1, r[i][j-1] + 1, r[i-1][j-1] + cost );
      }
    }

    return r;
  }

  /**
   * Return the smallest of the three numbers passed in
   * @param Number x
   * @param Number y
   * @param Number z
   * @return Number
   */
  function minimator(x, y, z) {
    if (x < y && x < z) return x;
    if (y < x && y < z) return y;
    return z;
  }

  return levenshteinenator;

}());

function distance(a, b) {
  var distArray = levenshteinenator(a.toLowerCase(), b.toLowerCase());
  return distArray[ distArray.length - 1 ][ distArray[ distArray.length - 1 ].length - 1 ];
}



//console.log(distance("abc", "abcde"));

function init() {
  if (!('webkitSpeechRecognition' in window)) {
    upgrade();
  } else {
    //start_button.style.display = 'inline-block';
    if (recognizing) {
      recognition.stop();
    }
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
      recognizing = true;
      showInfo('service started!');
    };

    recognition.onerror = function(event) {
      if (event.error == 'no-speech') {
        showInfo('no speech');
        ignore_onend = true;
      }
      if (event.error == 'audio-capture') {
        showInfo('no microphone');
        ignore_onend = true;
      }
      if (event.error == 'not-allowed') {
        showInfo('permission denied!');
        ignore_onend = true;
      }
      //window.open(chrome.extension.getURL("permission.html")); //TODO
      //setTimeout(init, 5000);
    };
    recognition.onend = function() {
      setTimeout(init, 1000);
      console.log('restarting...');
      recognizing = false;
    };

    recognition.onresult = function(event) {
      //console.log('got result');
      interim_transcript = '';
      var trans = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        var t = event.results[i][0].transcript;
console.log(t);
        if (event.results[i].isFinal) {
          trans += t;
        } else {
          interim_transcript += t;
        }  
        
      }
      handle(trans);

      
      
    };


    final_transcript = '';
    recognition.start();
  }
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

// function startButton(event) {
//   if (recognizing) {
//     recognition.stop();
//     return;
//   }
//   final_transcript = '';
//   recognition.lang = 'en-US';
//   recognition.start();
//   ignore_onend = false;
//   showInfo('info_allow');
// }
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

// function speak(){
//   //create start command ok start

//   var msg = new SpeechSynthesisUtterance(final_transcript + " " + interim_transcript);
//   console.log(final_transcript);
   
// 	if (final_transcript === "Open"){
// 		window.open("http://www.google.com");
// 	} else {
// 		console.log("Does not work");
// 	}

// }

// function addFinalTranscript(t) {
//   if(!t) return;
//   var words = t.split(' ');
//   for(var i = 0; i<words.length; i++) {
//     //console.log('checking '+words[i]);
      
//       words = words.slice(i);
//       //words.push(';\n');
//       final_transcript += words.join(' ');
//       handle(words.slice(1).join(' '));
//       //console.log("> "+final_transcript);
//       break;
//   }

// }


function handle(request) {
  if(!request) return;
console.log('handle: ' + request);
  requests.push(request);

  var words = request.trim().split(/\s+/);
  if(words.length < 2) { //TODO
    console.log('command is too short');
    return;
  }
  if(distance(words[0], magic_word) > 2) {
    console.log('command contains no magic word');
    return; 
  }
//console.log('parsing: ' + words.join(","));
  var target = words[0];
  var command = words[1];
  var params = words.slice(2);

  notify(capitalize(words.slice(1).join(' ')));

  switch(true) {
    case distance(command, 'find') <= 1:
      console.log('finding....'+params.join(','));
      if(params[params.length-1] === 'Amazon') {
        var q = params.slice(0, params.length-2);
        console.log('q = '+q.join(' '));
        amazon(q);
      }
      break;
    case distance(command, 'google') <= 1:
      google(params);
      break;
    case distance(command, 'say') <= 1:
      say(params.join(' '));
      break;
    case distance(command, 'read') <= 1:
      if($.inArray('story', params)) {
        say(story);  
      } else {
        console.log("what to read?");
      }
      break;
    case distance(command, 'press') <= 1:
      //TODO
      var page_up = 33;
      var page_down = 34;
      if(words.slice(1).join(' ') === 'page up') {
        console.log("press page up");
        press(page_up);
      } else if(words.slice(1).join(' ' === 'page down')) {
        console.log("press page down");
        press(page_down);
      }
      break;
    case distance(command, 'stop') <= 2:
      window.speechSynthesis.cancel();
      break;
    case distance(command, 'top') <= 1:
      window.scrollBy(0, 0)
      break;
    default:
      params.unshift(command)
      google(params);
      break;
  }
}

function press(keycode) {
  $(function() {
    var e = $.Event('keypress');
    e.which = keycode; // Character 'A'
    $('window').trigger(e);
  });
}

function say(msg) {
  var msg = new SpeechSynthesisUtterance(msg);
  msg.lang = 'en-US';
  window.speechSynthesis.speak(msg);
}

function google(queries) {
  //console.log('q: '+queries);
  say('searching '+ queries.join(' ') + ' on Google.');
  if(!queries) return;

  window.open('https://www.google.com/#q='+
      queries.join('+'));  
}

function amazon(queries) {
  say('finding '+ queries.join(' ')+" on Amazon.");
  window.open('http://www.amazon.com/s/?field-keywords='+
    queries.join('+'))
}

function notify(msg) {
	
var notification = new Notification("New Email Received", { icon: "dog.png" })

  //var notification = new Notification(msg);
  setTimeout(function(){
      notification.close();
  }, 3000); 
}


init();

