import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState("image/png"); // Estado para almacenar el formato seleccionado

  // Maneja la carga de imágenes desde un archivo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Maneja la carga mediante arrastrar y soltar
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setImage(file);
  };

  // Evita que el navegador abra archivos al arrastrarlos
  const handleDragOver = (e) => {
    e.preventDefault();
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
            "X-Api-Key": "r2S3kn65vxcB9yCpaBWwxumB" // Reemplaza con tu clave de API
          },
          responseType: "blob" // Devuelve la imagen como un blob
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

  // Función para descargar la imagen procesada con el tamaño y formato correcto
  const handleDownload = () => {
    const img = new Image();
    img.src = processedImage;

    img.onload = () => {
      // Crea un canvas y redimensiona la imagen a 600x600 píxeles
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 600; // Ancho de 600px
      canvas.height = 600; // Alto de 600px

      // Dibuja la imagen redimensionada en el canvas con fondo blanco
      ctx.fillStyle = "#FFFFFF"; // Fondo blanco
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Aplica el fondo blanco
      ctx.drawImage(img, 0, 0, 600, 600);

      // Crea un enlace de descarga para la imagen redimensionada en el formato seleccionado
      const a = document.createElement("a");
      a.href = canvas.toDataURL(fileFormat); // Usa el formato seleccionado (PNG o JPG)
      a.download = `imagen_procesada.${
        fileFormat === "image/png" ? "png" : "jpg"
      }`; // El nombre del archivo descargado
      a.click();
    };
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Remove Background App
        </h1>

        {/* Zona de arrastrar y soltar */}
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

        {/* Input para seleccionar imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full mb-6 p-2 border-2 border-gray-300 rounded-md"
        />

        {/* Selector de formato de archivo (PNG o JPG) */}
        <div className="mb-6">
          <label htmlFor="fileFormat" className="block text-gray-700 mb-2">
            Selecciona el formato de imagen:
          </label>
          <select
            id="fileFormat"
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            className="block w-full p-2 border-2 border-gray-300 rounded-md"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
          </select>
        </div>

        {/* Botón para procesar */}
        <button
          onClick={handleRemoveBackground}
          disabled={loading}
          className={`w-full py-3 bg-blue-500 text-white rounded-lg shadow-md transform transition-all duration-200 ${
            loading ? "opacity-50" : "hover:scale-105 hover:bg-blue-600"
          }`}
        >
          {loading ? "Procesando..." : "Eliminar fondo"}
        </button>

        {/* Mostrar resultados */}
        <div className="mt-6">
          {image && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Imagen original:
              </h3>
              <img
                src={URL.createObjectURL(image)}
                alt="Original"
                className="mx-auto w-48 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

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
              <br />
              {/* Botón de descarga */}
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
    </div>
  );
}
