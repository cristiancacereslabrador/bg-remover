import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Función para descargar la imagen procesada con el tamaño correcto
  const handleDownload = () => {
    const img = new Image();
    img.src = processedImage;

    img.onload = () => {
      // Crea un canvas y redimensiona la imagen a 600x600 píxeles
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 600; // Ancho de 600px
      canvas.height = 600; // Alto de 600px

      // Dibuja la imagen redimensionada en el canvas
      ctx.drawImage(img, 0, 0, 600, 600);

      // Crea un enlace de descarga para la imagen redimensionada
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "imagen_procesada.png"; // El nombre del archivo descargado
      a.click();
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Remove Background App</h1>

      {/* Zona de arrastrar y soltar */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #ddd",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
          width: "300px",
          margin: "0 auto",
          backgroundColor: "#f9f9f9"
        }}
      >
        {image ? (
          <p>¡Imagen cargada! Puedes continuar.</p>
        ) : (
          <p>Arrastra una imagen aquí o haz clic para seleccionarla.</p>
        )}
      </div>

      {/* Input para seleccionar imagen */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: "20px" }}
      />
      <br />

      {/* Botón para procesar */}
      <button onClick={handleRemoveBackground} disabled={loading}>
        {loading ? "Procesando..." : "Eliminar fondo"}
      </button>

      {/* Mostrar resultados */}
      <div style={{ marginTop: "20px" }}>
        {image && (
          <div>
            <h3>Imagen original:</h3>
            <img
              src={URL.createObjectURL(image)}
              alt="Original"
              style={{ width: "300px", border: "1px solid #ddd" }}
            />
          </div>
        )}

        {processedImage && (
          <div style={{ marginTop: "20px" }}>
            <h3>Imagen procesada:</h3>
            <img
              src={processedImage}
              alt="Procesada"
              style={{ width: "300px", border: "1px solid #ddd" }}
            />
            <br />
            {/* Botón de descarga */}
            <button onClick={handleDownload} style={{ marginTop: "20px" }}>
              Descargar imagen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
