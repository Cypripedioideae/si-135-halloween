import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const MAX_RAW_SIZE = 10 * 1024 * 1024;

export async function compressImage(
  file: File,
  maxDimension = 1920,
  quality = 0.75,
): Promise<Blob> {
  if (file.type === "image/svg+xml") {
    return file;
  }
  if (file.type === "image/gif") {
    throw new Error("GIF files are not supported");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Resize proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to web-friendly JPEG blob with compression quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, uid: string) {
  if (!file.type.startsWith("image/")) throw new Error("Only images allowed");
  if (file.size > MAX_RAW_SIZE) throw new Error("File must be under 10MB");

  const compressedBlob = await compressImage(file);
  const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
  const fileRef = ref(storage, `users/${uid}/${Date.now()}-${cleanName}`);

  await uploadBytes(fileRef, compressedBlob, { contentType: "image/jpeg" });
  const url = await getDownloadURL(fileRef);

  return { url, path: fileRef.fullPath };
}

export async function uploadImages(files: File[], uid: string) {
  const uploadPromises = files.map((file) => uploadImage(file, uid));
  return Promise.all(uploadPromises);
}
