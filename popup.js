

//chrome.extension.getBackgroundPage().console.log('hi');
var bg = chrome.extension.getBackgroundPage();

bg.console.log('hi!');

function btnClick() {
  //startButton(null);
  //alert('hi');
  bg.console.log('button pressed!');
}