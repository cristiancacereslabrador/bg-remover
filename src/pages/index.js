import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import getCroppedImg from "./utils/cropImage"; // Ruta corregida

// Carga dinámica para evitar errores en el servidor
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false });

export default function Home() {
  const API1 = process.env.NEXT_PUBLIC_API_1;
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState("image/png");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const cropperContainerRef = useRef(null);

  useEffect(() => {
    if (!API1) {
      console.error("API Key no encontrada. Revisa tu archivo .env.");
    }
  }, []);

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
      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        { image_file: image, size: "auto" },
        {
          headers: {
            "X-Api-Key": API1,
            "Content-Type": "multipart/form-data"
          },
          responseType: "blob"
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      setProcessedImage(blobUrl);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      alert("Ocurrió un error. Verifica tu API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (!cropperContainerRef.current.contains(e.target)) return;

    const newZoom = zoom + (e.deltaY > 0 ? -0.1 : 0.1);
    setZoom(Math.min(Math.max(newZoom, 1), 3));
  };

  const handleDownload = async () => {
    if (!processedImage) return;

    const croppedImageUrl = await getCroppedImg(
      processedImage,
      croppedAreaPixels,
      fileFormat
    );

    const a = document.createElement("a");
    a.href = croppedImageUrl;
    a.download = `imagen_procesada.${
      fileFormat === "image/png" ? "png" : "jpg"
    }`;
    a.click();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Remove Background App
        </h1>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-4 border-dashed border-gray-300 rounded-lg p-8 mb-6 flex justify-center items-center"
        >
          {image ? (
            <p className="text-gray-700">¡Imagen cargada! Puedes continuar.</p>
          ) : (
            <p className="text-gray-500">
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
            className="mb-6 relative w-full h-48 border border-gray-300 rounded-md"
            ref={cropperContainerRef}
            onWheel={handleWheel}
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

        <div className="mb-6">
          <label htmlFor="fileFormat" className="block text-gray-700 mb-2">
            Selecciona el formato de imagen:
          </label>
          <select
            id="fileFormat"
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            className="block w-full p-2 border-2 border-gray-300 rounded-md bg-gray-200"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
          </select>
        </div>

        <button
          onClick={handleRemoveBackground}
          disabled={loading}
          className={`w-full py-3 bg-blue-500 text-white rounded-lg shadow-md transform transition-all duration-200 ${
            loading ? "opacity-50" : "hover:scale-105 hover:bg-blue-600"
          }`}
        >
          {loading ? "Procesando..." : "Eliminar fondo"}
        </button>

        {processedImage && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Imagen procesada:
            </h3>
            <img
              src={processedImage}
              alt="Procesada"
              className="mx-auto w-48 h-48 object-cover rounded-lg shadow-md"
            />
            <button
              onClick={handleDownload}
              className="mt-4 py-3 px-6 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300"
            >
              Descargar imagen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
