import { createAudioController } from "./audio/audio-controller.js";
import { audioMap } from "./audio/audio-const.js";
import { createImageLoader } from "./image/image-loader.js";
import { imageList } from "./image/image-const.js";

const leftControlsEl = document.querySelector(".mobile-controls-left");
const rightControlsEl = document.querySelector(".mobile-controls-right");
/** Left cowboy HTML element */
const cowboyLeftEl = document.getElementById("cowboy-left");
/** Right cowboy HTML element */
const cowboyRightEl = document.getElementById("cowboy-right");
/** Main text HTML element */
const displayTextEl = document.getElementById("main-text");

if (!(leftControlsEl instanceof HTMLDivElement))
  throw new Error("'.mobile-controls-left' not found or not a div");
if (!(rightControlsEl instanceof HTMLDivElement))
  throw new Error("'.mobile-controls-right' not found or not a div");
if (!(cowboyLeftEl instanceof HTMLDivElement))
  throw new Error("'#cowboyLeft' not found or not a div");
if (!(cowboyRightEl instanceof HTMLDivElement))
  throw new Error("'#cowboyRight' not found or not a div");
if (!(displayTextEl instanceof HTMLHeadingElement))
  throw new Error("'#displayText' not found or not a header");

const ImageLoader = createImageLoader();
const AudioController = createAudioController();

/** @type {boolean} Whether the left cowboy is ready for a duel */
let isLeftReady;
/** @type {boolean} Whether the right cowboy is ready for a duel */
let isRightReady;
/** @type {boolean} Whether shooting is possible */
let canShoot;
/** @type {boolean} Whether killing is allowed (during the BANG phase) */
let canKill;
/** @type {number} Timeout ID for the shooting timer */
let timeoutId;
/** @type {boolean} Whether the left cowboy won */
let isLeftWinner;
/** @type {boolean} Whether the right cowboy won */
let isRightWinner;
/** @type {boolean} Whether the game ended in a draw */
let isDraw;

/**
 * Updates the game UI based on current game state
 */
const renderGame = () => {
  cowboyLeftEl.classList.toggle("ready", isLeftReady);
  cowboyRightEl.classList.toggle("ready", isRightReady);
  cowboyLeftEl.classList.toggle("winner", isLeftWinner);
  cowboyRightEl.classList.toggle("winner", isRightWinner);
  cowboyLeftEl.classList.toggle("dead", isRightWinner);
  cowboyRightEl.classList.toggle("dead", isLeftWinner);

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
  displayTextEl.innerText = renderText;
};

/**
 * Resets the game to its initial state
 */
const resetGame = () => {
  clearTimeout(timeoutId);
  AudioController.stopAllSounds();

  isLeftReady = false;
  isRightReady = false;
  canShoot = false;
  canKill = false;
  isLeftWinner = false;
  isRightWinner = false;
  isDraw = false;

  renderGame();
};

/**
 * Starts the shooting timer with a random delay from 3s to 10s
 */
const startShootingTimer = () => {
  const timerDelay = 3_000 + Math.random() * 7_000;
  AudioController.playSound("countdown");

  timeoutId = setTimeout(() => {
    canKill = true;
    AudioController.stopAllSounds();
    AudioController.playSound("bang");

    if (!isLeftReady && !isRightReady) {
      isDraw = true;
      canShoot = false;
    }

    renderGame();
  }, timerDelay);
};

const handleShoot = (isLeft) => {
  if (isLeft) {
    if (canKill && isLeftReady) {
      isLeftWinner = true;
      canShoot = false;
      AudioController.playSound("gunshot");
      AudioController.playSound("win");
    } else {
      AudioController.playSound("misfire");
    }

    isLeftReady = false;
  } else {
    if (canKill && isRightReady) {
      isRightWinner = true;
      canShoot = false;
      AudioController.playSound("gunshot");
      AudioController.playSound("win");
    } else {
      AudioController.playSound("misfire");
    }

    isRightReady = false;
  }

  renderGame();
};

const handleReady = (isLeft) => {
  if (isLeft) {
    if (isLeftWinner || isDraw) {
      resetGame();
    }
    if (!isLeftReady && !isRightWinner) {
      isLeftReady = true;
      AudioController.playSound("reload");
    }
  } else {
    if (isRightWinner || isDraw) {
      resetGame();
    }
    if (!isRightReady && !isLeftWinner) {
      isRightReady = true;
      AudioController.playSound("reload");
    }
  }
  if (isLeftReady && isRightReady) {
    canShoot = true;
    startShootingTimer();
  }

  renderGame();
};

const handleRelease = (isLeft) => {
  if (isLeft) {
    isLeftReady = false;
  } else {
    isRightReady = false;
  }
  renderGame();
};

// ---------- Event handlers ----------

/**
 * Handles keydown events
 * @param {KeyboardEvent} event - The keyboard event
 */
const handleKeyDown = (event) => {
  if (canShoot) {
    if (event.code === "ShiftLeft") {
      handleShoot(true);
    } else if (event.code === "ShiftRight") {
      handleShoot(false);
    }
    return;
  }

  if (event.code === "ControlLeft") {
    handleReady(true);
  } else if (event.code === "ControlRight") {
    handleReady(false);
  }
};

/**
 * Handles keyup events
 * @param {KeyboardEvent} event - The keyboard event
 */
const handleKeyUp = (event) => {
  if (canShoot) {
    return;
  }

  if (event.code === "ControlLeft") {
    handleRelease(true);
  } else if (event.code === "ControlRight") {
    handleRelease(false);
  }
};

const handleTouch = (isLeft) => {
  if (canShoot) {
    handleShoot(isLeft);
  } else {
    handleReady(isLeft);
  }
};

const handleTouchEnd = (isLeft) => {
  if (!canShoot) {
    handleRelease(isLeft);
  }
};

const handleLeftTouch = () => handleTouch(true);
const handleRightTouch = () => handleTouch(false);

const handleLeftTouchEnd = () => handleTouchEnd(true);
const handleRightTouchEnd = () => handleTouchEnd(false);

/**
 * Initializes the game by loading media, setting up event listeners, and resetting the game state
 */
export const initGame = () => {
  ImageLoader.loadImages(imageList);
  AudioController.loadSounds(audioMap);

  resetGame();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  playerLeft.addEventListener("pointerdown", handleLeftTouch);
  playerRight.addEventListener("pointerdown", handleRightTouch);
  playerLeft.addEventListener("pointerup", handleLeftTouchEnd);
  playerRight.addEventListener("pointerup", handleRightTouchEnd);
};
