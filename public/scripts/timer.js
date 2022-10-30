let start = document.getElementById("start");
let stop = document.getElementById("stop");
let reset = document.getElementById("reset");

let wm = document.getElementById("w_minutes");
let ws = document.getElementById("w_seconds");

let bm = document.getElementById("b_minutes");
let bs = document.getElementById("b_seconds");

//store a reference to a timer variable
let startTimer;

//set the time interval to 1 seconds, if its running alert user.
start.addEventListener("click", function () {
  if (startTimer === undefined) {
    startTimer = setInterval(timer, 1000);
  } else {
    alert("Timer is already running");
  }
});

//Reset the values, stop the interval and set startTimer to undefined.
reset.addEventListener("click", function () {
  wm.innerText = 25;
  ws.innerText = "00";

  bm.innerText = 5;
  bs.innerText = "00";

  document.getElementById("cycles").innerText = 0;
  stopInterval();
  startTimer = undefined;
});

//
stop.addEventListener("click", function () {
  stopInterval();
  startTimer = undefined;
});

//Start Timer Function
function timer() {
  //Work Timer Countdown
  if (ws.innerText != 0) {
    ws.innerText--;
  } else if (wm.innerText != 0 && ws.innerText == 0) {
    ws.innerText = 59;
    wm.innerText--;
  }

  //Break Timer Countdown
  if (wm.innerText == 0 && ws.innerText == 0) {
    if (bs.innerText != 0) {
      bs.innerText--;
    } else if (bm.innerText != 0 && bs.innerText == 0) {
      bs.innerText = 59;
      bm.innerText--;
    }
  }

  //Increment cycles by one if one full cycle is completed
  if (
    wm.innerText == 0 &&
    ws.innerText == 0 &&
    bm.innerText == 0 &&
    bs.innerText == 0
  ) {
    wm.innerText = 25;
    ws.innerText = "00";

    bm.innerText = 5;
    bs.innerText = "00";

    document.getElementById("cycles").innerText++;
  }
}

//Stop Timer Function
function stopInterval() {
  clearInterval(startTimer);
}
