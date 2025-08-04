let isLeftReady = false;
let isRightReady = false;
let canShoot = false;
let canKill = false;
let timeoutId;

const resetGame = () => {
  isLeftReady = false;
  isRightReady = false;
  canShoot = false;
  canKill = false;
  clearTimeout(timeoutId);
};

const startTimer = () => {
  const timerDelay = 3_000 + Math.random() * 7_000;

  timeoutId = setTimeout(() => {
    console.log("Shoot!!!");
    canKill = true;
    if (isLeftReady === false && isRightReady === false) {
      alert("It's a draw! Reset game...");
      resetGame();
    }
  }, timerDelay);
};

const handleKeyDown = (event) => {
  if (canShoot) {
    if (event.code === "ShiftLeft") {
      if (canKill && isLeftReady) {
        alert("Left wins!");
        resetGame();
      } else {
        isLeftReady = false;
      }
    } else if (event.code === "ShiftRight") {
      if (canKill && isRightReady) {
        alert("Right wins!");
        resetGame();
      } else {
        isRightReady = false;
      }
    }
    return;
  }

  if (event.code === "ControlLeft") {
    isLeftReady = true;
  } else if (event.code === "ControlRight") {
    isRightReady = true;
  }

  if (isLeftReady && isRightReady) {
    console.log("Get ready...");
    canShoot = true;
    startTimer();
  }
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
};

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
