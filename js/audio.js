import { soundMap } from "./soundMap.js";

/**
 * Creates and manages audio context and sounds
 */
export const createAudioManager = () => {
  const audioContext = new AudioContext();

  /** Master gain node for volume control */
  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.value = 0.7; // TODO: volume controls

  /**
   * Loaded audio buffers
   * @type {Object<keyof soundMap, AudioBuffer | null>}
   */
  const buffers = {};

  /**
   * Currently playing sounds for potential cleanup
   * @type {Set<AudioBufferSourceNode>}
   */
  const activeSources = new Set();

  /**
   * Loads an audio file and returns its buffer
   * @param {string} url - Path to audio file
   * @returns {Promise<AudioBuffer | null>} Loaded audio buffer
   */
  const loadAudioFile = async (url) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error("Error loading audio file:", error);
      return null;
    }
  };

  /**
   * Loads game sounds
   * @param {soundMap} soundFiles - Map of sound names to file paths
   * @returns {Promise<void>}
   */
  const loadSounds = async (soundFiles) => {
    try {
      await Promise.all(
        Object.entries(soundFiles).map(async ([name, url]) => {
          buffers[name] = await loadAudioFile(url);
        })
      );
    } catch (error) {
      console.error("Error loading sounds:", error);
    }
  };

  /**
   * Resumes audio context if suspended
   */
  const resumeContext = async () => {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  };

  /**
   * Plays a loaded sound
   * @param {keyof soundMap} soundName - Name of the sound to play
   * @param {Object} [options] - Playback options
   * @param {number} [options.volume=1] - Volume (0 to 1)
   * @param {number} [options.playbackRate=1] - Playback speed
   */
  const playSound = async (soundName, options = {}) => {
    if (!buffers[soundName]) {
      console.warn(`Sound "${soundName}" not loaded`);
      return;
    }

    await resumeContext();

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = buffers[soundName];
    source.playbackRate.value = options.playbackRate || 1.0;
    gainNode.gain.value = options.volume ?? 1.0;

    source.connect(gainNode);
    gainNode.connect(masterGain);

    const cleanup = () => {
      source.disconnect();
      gainNode.disconnect();
      activeSources.delete(source);
    };

    source.onended = cleanup;
    activeSources.add(source);

    source.start();
  };

  /**
   * Stops all currently playing sounds
   */
  const stopAllSounds = () => {
    activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (err) {
        // Source might have already ended
      }
    });
    activeSources.clear();
  };

  return {
    loadSounds,
    playSound,
    stopAllSounds,
    resumeContext,
  };
};
