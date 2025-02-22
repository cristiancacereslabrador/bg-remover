import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import getCroppedImg from "./utils/cropImage";

export default function Home() {
  const API1 = process.env.NEXT_PUBLIC_API_1;
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState("image/jpeg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const cropperContainerRef = useRef(null);

  useEffect(() => {
    const api1Last8 = API1.slice(-8);
    console.log("API1 cargada: ", api1Last8);
  }, []);

  const handleWheelEvent = (e) => {
    if (!cropperContainerRef.current) return;
    if (!cropperContainerRef.current.contains(e.target)) return;

    e.preventDefault();

    const newZoom = zoom + (e.deltaY > 0 ? -0.1 : 0.1);
    setZoom(Math.min(Math.max(newZoom, 1), 3));
  };

  useEffect(() => {
    const cropperContainer = cropperContainerRef.current;

    if (cropperContainer) {
      cropperContainer.addEventListener("wheel", handleWheelEvent, {
        passive: false
      });
    }

    return () => {
      if (cropperContainer) {
        cropperContainer.removeEventListener("wheel", handleWheelEvent);
      }
    };
  }, [zoom]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveBackground = async () => {
    if (!image) {
      alert("Por favor, selecciona una imagen primero.");
      return;
    }

    setLoading(true);

    try {
      const croppedImageUrl = await getCroppedImg(
        image,
        croppedAreaPixels,
        fileFormat
      );

      const response = await fetch(croppedImageUrl);
      const croppedBlob = await response.blob();

      const formData = new FormData();
      formData.append(
        "image_file",
        croppedBlob,
        `image.${fileFormat.split("/")[1]}`
      );
      formData.append("size", "auto");

      const apiResponse = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        formData,
        {
          headers: {
            "X-Api-Key": API1,
            "Content-Type": "multipart/form-data"
          },
          responseType: "blob"
        }
      );

      const blobUrl = URL.createObjectURL(apiResponse.data);
      setProcessedImage(blobUrl);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      alert("Ocurrió un error. Verifica tu API Key.");
    } finally {
      setLoading(false);
    }
  };

  // //   const handleDownload = async () => {
  // //     if (!processedImage) return;

  // //     const response = await fetch(processedImage);
  // //     const blob = await response.blob();

  // //     const a = document.createElement("a");
  // //     a.href = URL.createObjectURL(blob);
  // //     a.download = `imagen_procesada.${fileFormat.split("/")[1]}`;
  // //     a.click();
  // //   };
  const handleDownload = async () => {
    if (!processedImage) return;

    const response = await fetch(processedImage);
    const blob = await response.blob();

    // Crear un objeto URL temporal para la imagen procesada
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    img.onload = () => {
      // Crear un canvas para renderizar la imagen procesada
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      // Dibujar un fondo blanco antes de renderizar la imagen
      ctx.fillStyle = "white"; // Color de fondo blanco
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Llenar todo el canvas

      // Dibujar la imagen procesada sobre el fondo blanco
      ctx.drawImage(img, 0, 0);

      // Convertir el canvas al formato seleccionado
      const dataUrl = canvas.toDataURL(fileFormat); // 'image/jpeg' o 'image/png'

      // Crear el enlace de descarga con el formato correcto
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `imagen_procesada.${fileFormat.split("/")[1]}`; // jpg o png
      a.click();

      // Liberar el objeto URL temporal
      URL.revokeObjectURL(img.src);
    };
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-600 p-6 rounded-lg shadow-lg shadow-black">
        <h1 className="sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center text-gray-900 mb-6 text-xl">
          Remove Background App
        </h1>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-4 border-dashed border-gray-300 rounded-lg p-8 mb-6 flex justify-center items-center"
        >
          {image ? (
            <p className="text-base text-gray-300">
              ¡Imagen cargada! Continúa.
            </p>
          ) : (
            <p className="text-gray-300">
              Arrastra una imagen aquí o haz clic para seleccionarla.
            </p>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full mb-6 p-2 border-2 border-gray-300 rounded-md"
        />

        {image && (
          <div
            // className="mb-6 relative w-full h-48 border border-gray-300 rounded-md"
            className="mb-6 relative w-full h-48 border-gray-300 rounded-md shadow-md"
            ref={cropperContainerRef}
            onWheel={handleWheelEvent}
          >
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
              aspect={1}
            />
          </div>
        )}

        <button
          onClick={handleRemoveBackground}
          disabled={loading}
          //   className={`w-full py-3 bg-sky-800 text-white rounded-lg shadow-md transform transition-all duration-200 uppercase ${
          className={`w-full mt-4 py-3 px-6 font-semibold bg-sky-800 text-gray-300 rounded-lg shadow-lg hover:bg-sky-700 transition-all duration-300 uppercase ${
            loading ? "opacity-50" : "hover:scale-105 hover:bg-sky-700"
          }`}
        >
          {loading ? "Procesando..." : "Eliminar fondo"}
        </button>

        {processedImage && (
          <>
            <div className="mt-4">
              <label
                htmlFor="fileFormat"
                className="block text-gray-300 mb-2 font-semibold"
              >
                Selecciona el formato de imagen:
              </label>
              <select
                id="fileFormat"
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                className="block w-full p-2  font-semibold border-gray-900 rounded-md text-sky-700 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-700 shadow-md"
              >
                <option value="image/jpeg" className="text-sky-800">
                  JPG (Joint Photographic Experts Group)
                </option>
                <option value="image/png" className="text-sky-800">
                  PNG (Portable Network Graphics)
                </option>
              </select>
            </div>

            <div className="mt-6">
              <h3 className="block text-gray-300 mb-2 font-semibold">
                Imagen procesada:
              </h3>
              <img
                src={processedImage}
                alt="Procesada"
                className="mx-auto w-48 h-48 object-cover rounded-lg shadow-md bg-white"
              />
              <button
                onClick={handleDownload}
                className="w-full mt-4 py-3 px-6 font-semibold bg-green-800 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 uppercase hover:scale-105"
              >
                Descargar imagen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
