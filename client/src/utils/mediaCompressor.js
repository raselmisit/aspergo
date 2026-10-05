/**
 * ASPER GO Client-side Media Compression & Optimizer Utility
 * Automatically downscales & compresses heavy photos and inspects videos
 */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Compress an image file using HTML5 Canvas
 * @param {File} file 
 * @param {Object} options 
 * @returns {Promise<{ file: File, originalSize: number, compressedSize: number, savedPercent: number, previewUrl: string, width: number, height: number }>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  // If not an image, return original
  if (!file || !file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file?.size || 0,
      compressedSize: file?.size || 0,
      savedPercent: 0,
      previewUrl: file ? URL.createObjectURL(file) : '',
      width: 0,
      height: 0
    };
  }

  // If image is a GIF or SVG, don't canvas compress (preserve animations / vectors)
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedPercent: 0,
      previewUrl: URL.createObjectURL(file),
      width: 0,
      height: 0
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                savedPercent: 0,
                previewUrl: URL.createObjectURL(file),
                width: img.width,
                height: img.height
              });
              return;
            }

            // Create compressed file with clean filename
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: mimeType,
              lastModified: Date.now()
            });

            // If compressed is unexpectedly larger than original (rare for small files), keep smaller
            const finalFile = (compressedFile.size < file.size) ? compressedFile : file;
            const originalSize = file.size;
            const compressedSize = finalFile.size;
            const savedPercent = originalSize > compressedSize 
              ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
              : 0;

            const previewUrl = URL.createObjectURL(finalFile);

            resolve({
              file: finalFile,
              originalSize,
              compressedSize,
              savedPercent,
              previewUrl,
              width,
              height
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = (err) => {
        console.error('Image load error during compression', err);
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          savedPercent: 0,
          previewUrl: URL.createObjectURL(file),
          width: 0,
          height: 0
        });
      };
    };

    reader.onerror = (err) => {
      console.error('File read error', err);
      reject(err);
    };
  });
}

/**
 * Inspects a video file and formats its size/metadata
 * @param {File} file 
 */
export function inspectVideo(file) {
  if (!file || !file.type.startsWith('video/')) {
    return null;
  }
  return {
    file,
    name: file.name,
    size: file.size,
    formattedSize: formatBytes(file.size),
    type: file.type,
    previewUrl: URL.createObjectURL(file)
  };
}
