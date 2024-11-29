export default async function getCroppedImg(
  imageSrc,
  croppedAreaPixels,
  fileFormat
) {
  // Asegúrate de que este código se ejecute solo en el cliente
  if (typeof window === "undefined") {
    return null;
  }

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo crear el blob"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      fileFormat || "image/png",
      1
    );
  });
}
