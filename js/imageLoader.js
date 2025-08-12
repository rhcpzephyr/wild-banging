/**
 * Creates an image loader with caching
 */
export const createImageLoader = () => {
  /** @type {Map<string, Promise<Image>>} */
  const cache = new Map();

  /**
   * Loads a single image with caching.
   * @param {string} url - Image URL to load
   * @returns {Promise<Image>} Resolves with loaded image
   */
  const loadImage = (url) => {
    const cachedImage = cache.get(url);
    if (cachedImage) {
      return cachedImage;
    }

    const imagePromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.fetchPriority = "high";

      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.warn(`Image load failed: ${url}`, err);
        reject(new Error(`IMAGE_LOAD_FAILED: ${url}`));
      };

      img.src = url;
    });

    cache.set(url, imagePromise);
    return imagePromise;
  };

  /**
   * Loads multiple images
   * @param {string[]} urls - Array of image URLs
   * @returns {Promise<Image[]>} Resolves with array of loaded images
   * @throws {TypeError} If urls is not an array or contains invalid URLs
   */
  const loadImages = (urls) => {
    if (!Array.isArray(urls)) {
      return Promise.reject(new TypeError("urls must be an array"));
    }

    const uniqueUrls = [...new Set(urls)];

    const imagePromises = uniqueUrls.map((url) => {
      if (typeof url !== "string") {
        return Promise.reject(new TypeError(`Invalid URL: ${url}`));
      }
      return loadImage(url);
    });

    return Promise.all(imagePromises);
  };

  return {
    loadImages,
  };
};
