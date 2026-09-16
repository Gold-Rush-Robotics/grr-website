/** WebP quality used for gallery full-resolution encodes. */
export const FULL_RES_WEBP_QUALITY = 0.85;

/**
 * PUT a file to a presigned URL with XMLHttpRequest so `onChunk` can drive a
 * progress bar. Resolves on HTTP 2xx.
 *
 * @param onChunk - Bytes uploaded since the previous progress event.
 */
export function putWithUploadProgress(
  file: File,
  uploadUrl: string,
  mimeType: string,
  onChunk: (delta: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastLoaded = 0;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const delta = event.loaded - lastLoaded;
      lastLoaded = event.loaded;
      if (delta > 0) onChunk(delta);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.send(file);
  });
}
