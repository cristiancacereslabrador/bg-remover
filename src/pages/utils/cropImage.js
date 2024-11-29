export default async function getCroppedImg(
  imageSrc,
  croppedAreaPixels,
  fileFormat
) {
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

  // Establece el tamaño del canvas
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  // Dibuja la imagen en el canvas, aplicando el recorte
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

  // Convierte el canvas en un blob o dataURL
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
      1 // Calidad máxima (para JPG)
    );
  });
}
