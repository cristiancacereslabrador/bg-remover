import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import getCroppedImg from "./utils/cropImage";

export default function Home() {
  const API1 = process.env.NEXT_PUBLIC_API_1;
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState("image/png");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  useEffect(() => {
    if (!API1) {
      console.error("API Key no encontrada. Revisa tu archivo .env.");
    } else {
      console.log("API KEY cargada correctamente:", API1);
    }
  }, []);
  // Ref para el contenedor de la imagen (cropper)
  const cropperContainerRef = useRef(null);

  //   useEffect(() => {
  //     console.log("APIKEY: ", API1);
  //   }, []);

  // Maneja la carga de imágenes desde un archivo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  // Maneja la carga mediante arrastrar y soltar
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setImage(URL.createObjectURL(file));
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

  // Maneja el evento de zoom con la rueda del ratón
  const handleWheel = (e) => {
    e.preventDefault();

    // Verifica si el mouse está dentro del área del cropper
    if (!cropperContainerRef.current.contains(e.target)) {
      return; // Si el mouse no está dentro del área, no hacer zoom
    }

    const newZoom = zoom + (e.deltaY > 0 ? -0.1 : 0.1); // Aumentar o disminuir el zoom
    setZoom(Math.min(Math.max(newZoom, 1), 3)); // Limitar el zoom entre 1 y 3
  };

  // Descarga la imagen procesada con el tamaño y formato correcto
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

        {/* Vista previa de la imagen con la opción de recortar */}
        {image && (
          <div
            className="mb-6 relative w-full h-48 border border-gray-300 rounded-md"
            ref={cropperContainerRef} // Referencia al contenedor
            onWheel={handleWheel} // Aquí agregamos el manejo de la rueda
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
              aspect={1} // Relación de aspecto cuadrada
            />
          </div>
        )}

        {/* Selector de formato de archivo */}
        <div className="mb-6">
          <label htmlFor="fileFormat" className="block text-gray-700 mb-2">
            Selecciona el formato de imagen:
          </label>
          <select
            id="fileFormat"
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            className="text-blue-500 block w-full p-2 border-2 border-gray-300 rounded-md bg-gray-200"
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

        {/* Imagen procesada */}
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
