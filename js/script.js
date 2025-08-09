/** Left cowboy HTML element */
const cowboyLeft = document.getElementById("cowboyLeft");
/** Right cowboy HTML element */
const cowboyRight = document.getElementById("cowboyRight");
/** Main text HTML element */
const displayText = document.getElementById("displayText");

if (!(cowboyLeft instanceof HTMLDivElement))
  throw new Error("#cowboyLeft not found or not a div");
if (!(cowboyRight instanceof HTMLDivElement))
  throw new Error("#cowboyRight not found or not a div");
if (!(displayText instanceof HTMLHeadingElement))
  throw new Error("#displayText not found or not a header");

let isLeftReady;
let isRightReady;
let canShoot;
let canKill;
let timeoutId;
let isLeftWinner;
let isRightWinner;
let isDraw;

const renderGame = () => {
  cowboyLeft.classList.toggle("ready", isLeftReady);
  cowboyRight.classList.toggle("ready", isRightReady);
  cowboyLeft.classList.toggle("winner", isLeftWinner);
  cowboyRight.classList.toggle("winner", isRightWinner);
  cowboyLeft.classList.toggle("dead", isRightWinner);
  cowboyRight.classList.toggle("dead", isLeftWinner);

  let renderText;

  if (isDraw) {
    renderText = "Too early, both of you... Restart game! (Ctrl)";
  } else if (isLeftWinner) {
    renderText = "Left wins! Good job... Press Ctrl to play again!";
  } else if (isRightWinner) {
    renderText = "Right wins! Good job... Press Ctrl to play again!";
  } else if (canKill) {
    renderText = "BANG!";
  } else if (canShoot) {
    renderText = "Get ready to bang... (use Shift)";
  } else {
    renderText = "Who's the fastest? Press both Ctrl's and check!";
  }
  displayText.innerText = renderText;
};

const resetGame = () => {
  isLeftReady = false;
  isRightReady = false;
  canShoot = false;
  canKill = false;
  isLeftWinner = false;
  isRightWinner = false;
  isDraw = false;
  clearTimeout(timeoutId);
  renderGame();
};

const startTimer = () => {
  const timerDelay = 3_000 + Math.random() * 7_000;

  timeoutId = setTimeout(() => {
    console.log("Shoot!!!");
    canKill = true;

    if (isLeftReady === false && isRightReady === false) {
      isDraw = true;
      canShoot = false;
      console.log("Draw :(");
    }

    renderGame();
  }, timerDelay);
};

const handleKeyDown = (event) => {
  if (canShoot) {
    if (event.code === "ShiftLeft") {
      if (canKill && isLeftReady) {
        isLeftWinner = true;
        canShoot = false;
      }
      isLeftReady = false;
    } else if (event.code === "ShiftRight") {
      if (canKill && isRightReady) {
        isRightWinner = true;
        canShoot = false;
      }
      isRightReady = false;
    }

    renderGame();
    return;
  }

  if (event.code === "ControlLeft") {
    if (isLeftWinner || isDraw) {
      resetGame();
    }
    if (!isRightWinner) {
      isLeftReady = true;
    }
  } else if (event.code === "ControlRight") {
    if (isRightWinner || isDraw) {
      resetGame();
    }
    if (!isLeftWinner) {
      isRightReady = true;
    }
  }

  if (isLeftReady && isRightReady) {
    console.log("Get ready...");
    canShoot = true;
    startTimer();
  }

  renderGame();
};

const handleKeyUp = (event) => {
  if (canShoot) {
    return;
  }

  if (event.code === "ControlLeft") {
    isLeftReady = false;
  } else if (event.code === "ControlRight") {
    isRightReady = false;
  }

  renderGame();
};

resetGame();
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
