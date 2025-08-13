import { createAudioController } from "./audio/audio-controller.js";
import { audioMap } from "./audio/audio-const.js";
import { createImageLoader } from "./image/image-loader.js";
import { imageList } from "./image/image-const.js";

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

/**
 * Handles keydown events
 * @param {KeyboardEvent} event - The keyboard event
 */
const handleKeyDown = (event) => {
  if (canShoot) {
    if (event.code === "ShiftLeft") {
      if (canKill && isLeftReady) {
        isLeftWinner = true;
        canShoot = false;
        AudioController.playSound("gunshot");
        AudioController.playSound("win");
      } else {
        AudioController.playSound("misfire");
      }

      isLeftReady = false;
    } else if (event.code === "ShiftRight") {
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
    return;
  }

  if (event.code === "ControlLeft") {
    if (isLeftWinner || isDraw) {
      resetGame();
    }
    if (!isLeftReady && !isRightWinner) {
      isLeftReady = true;
      AudioController.playSound("reload");
    }
  } else if (event.code === "ControlRight") {
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

/**
 * Handles keyup events
 * @param {KeyboardEvent} event - The keyboard event
 */
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

/**
 * Initializes the game by loading media, setting up event listeners, and resetting the game state
 */
export const initGame = () => {
  ImageLoader.loadImages(imageList);
  AudioController.loadSounds(audioMap);

  resetGame();
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
};
