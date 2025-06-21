from flask import Flask, request, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np
from io import BytesIO
from flask_cors import CORS  # Important for React frontend

app = Flask(__name__)
CORS(app)  # Allows React frontend to call this backend

# Load the trained model
MODEL = tf.keras.models.load_model("saved_models/model.h5")
CLASS_NAMES = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']  # Replace with your class labels

def preprocess_image(file_bytes):
    image = Image.open(BytesIO(file_bytes)).convert("RGB")  # Open and convert to RGB
    image = image.resize((256, 256))  # Now resize
    image = np.array(image)
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    try:
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        prediction = MODEL.predict(processed_image)
        predicted_class = CLASS_NAMES[np.argmax(prediction)]
        confidence = float(np.max(prediction))

        return jsonify({
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
