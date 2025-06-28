import sys
import asyncio
import platform
import mysql.connector
import logging
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np

# Set UTF-8 encoding for stdout to handle non-ASCII characters
sys.stdout.reconfigure(encoding='utf-8')

# Initialize the Flask app
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing
CORS(app)

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Load the trained model
model_path = "E:/Med-leaf Recognition/new test 004.1/leaf_model_final.h5"
try:
    model = load_model(model_path)
    logging.info("Model loaded successfully.")
except Exception as e:
    logging.error(f"Error loading model: {e}")
    model = None

# Define the class labels based on your model's output classes
class_labels = [
    'aloe vera', 'Amman Pacharisi', 'Betel', 'Black Nochi', 'Erukkan', 'Hibiscus', 'Keezhanelli', 'Kesavardhini',
    'Kuppaimeni', 'manathakkali', 'Mudakathan', 'Neem', 'Pasalai', 'Pirandai', 'Sangu poo', 'Thuthi', 'Turmeric'
]

# Database connection function
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="2003",
            database="plantsdb",
            charset='utf8mb4'  # Ensure UTF-8 encoding for database connection
        )
        logging.info("Database connection established.")
        return connection
    except mysql.connector.Error as err:
        logging.error(f"Database connection error: {err}")
        return None

# Retrieving plant data from database
def get_data_from_db(plant_name):
    db = get_db_connection()
    if db is None:
        return jsonify({"error": "Could not connect to the database."}), 500

    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM plants WHERE name LIKE %s"
    try:
        cursor.execute(query, (f'%{plant_name}%',))
        plant = cursor.fetchone()

        if plant:
            # Convert any byte fields to strings with UTF-8 decoding
            for key, value in plant.items():
                if isinstance(value, bytes):
                    try:
                        plant[key] = value.decode('utf-8')
                    except UnicodeDecodeError:
                        plant[key] = value.decode('latin1')  # Fallback encoding
                        logging.warning(f"Used latin1 fallback for decoding {key}")
            logging.debug(f"Plant found: {plant['name']}")
        else:
            logging.debug("Plant not found")
    except mysql.connector.Error as err:
        logging.error(f"Error executing query: {err}")
        return jsonify({"error": "Database query error."}), 500
    finally:
        cursor.close()
        db.close()

    if plant:
        return jsonify(plant)
    else:
        return jsonify({"message": "Plant not found"}), 404

# A simple route to test if the app is working
@app.route("/", methods=['GET'])
def home():
    return jsonify({"message": "Hello, this is the Medicinal Plant Prediction API."})

# Email validation function
def is_valid_email(email):
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(regex, email)

# Route for plant identification using the CNN model
@app.route('/predict', methods=['POST', 'GET'])
def predict():
    logging.debug(f"Received files: {request.files}")
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Load and preprocess the image
        img = Image.open(file.stream).convert("RGB")
        img = img.resize((226, 226))
        img = img_to_array(img)
        img = np.expand_dims(img, axis=0)
        img = img / 255.0

        # Make sure the model is loaded
        if model is None:
            logging.error("Model not loaded")
            return jsonify({"error": "Model not loaded"}), 500

        # Make a prediction
        prediction = model.predict(img)
        predicted_class = class_labels[np.argmax(prediction)]
        confidence = float(np.max(prediction))
        plant_name = predicted_class  # Use the class label directly
        logging.info(f"Predicted plant: {plant_name}, Confidence: {confidence}")
        return get_data_from_db(plant_name)

    except Exception as e:
        logging.error(f"Error processing the image: {e}")
        return jsonify({"error": "An error occurred while processing the image."}), 500

# Route for searching plants in the database
@app.route('/search', methods=['GET'])
def search_plant():
    plant_name = request.args.get('query')
    logging.debug(f"Searching for plant: {plant_name}")
    return get_data_from_db(plant_name)

# Route for handling form submissions when a plant is not found
@app.route('/submit', methods=['POST'])
def submit_issue():
    description = request.form.get('description')
    email = request.form.get('email')
    image = request.files['image'].read() if 'image' in request.files else None

    # Input validation
    if not description or not email or not is_valid_email(email):
        logging.error("Invalid input: Description and valid email are required")
        return jsonify({"error": "Description and a valid email are required."}), 400

    db = get_db_connection()
    if db is None:
        return jsonify({"error": "Could not connect to the database."}), 500

    cursor = db.cursor()
    query = "INSERT INTO admin_issues (description, email, image) VALUES (%s, %s, %s)"
    
    try:
        cursor.execute(query, (description, email, image))
        db.commit()
    except mysql.connector.Error as err:
        logging.error(f"Error executing query: {err}")
        return jsonify({"error": "Database insertion error."}), 500
    finally:
        cursor.close()
        db.close()

    logging.debug(f"Issue submitted: {description}, {email}")
    return jsonify({"message": "Issue submitted successfully."}), 200

# Run the app
if __name__ == '__main__':
    try:
        app.run(debug=True)
    except Exception as e:
        logging.error(f"Error running the app: {e}")
        