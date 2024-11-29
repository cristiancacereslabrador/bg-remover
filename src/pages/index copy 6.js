import React, { useState } from "react";
import axios from "axios";
import Cropper from "react-easy-crop"; // Usamos react-easy-crop para recortar y hacer zoom
import getCroppedImg from "./utils/cropImage"; // Función personalizada para obtener el recorte

export default function Home() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState("image/png");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Maneja la carga de imágenes desde un archivo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // Procesa la imagen usando la API de Remove.bg
  const handleRemoveBackground = async () => {
    if (!image) {
      alert("Por favor, selecciona una imagen primero.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image_file", image);
    formData.append("size", "auto");

    try {
      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        formData,
        {
          headers: {
            "X-Api-Key": `${import.meta.env.BG_REMOVER_API_1}`
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

  // Obtén el recorte desde el área seleccionada
  const handleCropComplete = async () => {
    const croppedImage = await getCroppedImg(
      image,
      croppedAreaPixels,
      fileFormat
    );
    setProcessedImage(croppedImage);
  };

  // Descargar la imagen procesada
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `imagen_procesada.${
      fileFormat === "image/png" ? "png" : "jpg"
    }`;
    link.click();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Remove Background App
        </h1>

        {/* Input para cargar imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full mb-6 p-2 border-2 border-gray-300 rounded-md"
        />

        {/* Vista previa con Cropper */}
        {image && (
          <div className="relative w-full h-64 border border-gray-300 rounded-md mb-6">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1} // Relación de aspecto cuadrada
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
            />
          </div>
        )}

        {/* Selector de formato */}
        <div className="mb-6">
          <label htmlFor="fileFormat" className="block text-gray-700 mb-2">
            Formato:
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

        {/* Botones para procesar y descargar */}
        <button
          onClick={handleRemoveBackground}
          disabled={loading}
          className={`w-full py-3 bg-blue-500 text-white rounded-lg shadow-md transform transition-all duration-200 ${
            loading ? "opacity-50" : "hover:scale-105 hover:bg-blue-600"
          } mb-4`}
        >
          {loading ? "Procesando..." : "Eliminar fondo"}
        </button>
        {processedImage && (
          <button
            onClick={handleDownload}
            className="w-full py-3 bg-green-500 text-white rounded-lg shadow-md transform transition-all duration-200 hover:scale-105 hover:bg-green-600"
          >
            Descargar Imagen
          </button>
        )}
      </div>
    </div>
  );
}
