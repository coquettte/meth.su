var keyPresses = [];
var secretCode = ['m', 'e', 't', 'h'];

function checkSecretCode(e) {
  keyPresses.push(e.key);

  if (keyPresses.length === secretCode.length &&
      keyPresses.every((value, index) => value === secretCode[index])) {
      document.getElementById('musci').play();
  }
  
  setTimeout(function() {
    keyPresses = [];
  }, 3000);
}
document.addEventListener("keydown", checkSecretCode);