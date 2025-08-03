let isLeftReady = false;
let isRightReady = false;
let canShoot = false;

const resetGame = () => {
  isLeftReady = false;
  isRightReady = false;
  canShoot = false;
};

const handleKeyDown = (event) => {
  if (canShoot) {
    if (event.code === "ShiftLeft") {
      alert("Left wins!");
      resetGame();
    } else if (event.code === "ShiftRight") {
      alert("Right wins!");
      resetGame();
    }
    return;
  }

  if (event.code === "ControlLeft") {
    isLeftReady = true;
  } else if (event.code === "ControlRight") {
    isRightReady = true;
  }

  if (isLeftReady && isRightReady) {
    console.log("Shoot your shot!");
    canShoot = true;
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
