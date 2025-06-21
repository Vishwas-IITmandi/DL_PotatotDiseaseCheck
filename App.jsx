import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handlePredict = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setPrediction(data);
      } else {
        alert(data.error || "Prediction failed");
      }
    } catch (error) {
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🧠 CNN Image Predictor</h1>

      <div
        className="drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="preview" />
        ) : (
          <p>Drag & drop an image here or click to browse</p>
        )}
      </div>

      <button onClick={handlePredict} disabled={!image || loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {prediction && (
        <div className="result">
          <h3>Prediction:</h3>
          <p>Class: <strong>{prediction.predicted_class}</strong></p>
          <p>Confidence: <strong>{(prediction.confidence * 100).toFixed(2)}%</strong></p>
        </div>
      )}
    </div>
  );
}

export default App;