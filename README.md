# 🌿 Binomial Recognition and Medicinal Representation

A deep learning-powered plant recognition system that identifies medicinal plants from leaf images and provides information on their safe usage.

------------------------------------------------------------

## 🚀 Features

- 🧠 CNN-based plant image recognition
- 👩‍🏫 Individual attention to each leaf sample
- 🧾 Medicinal properties and usage recommendations
- 🔍 Admin-reviewed submissions for database expansion
- 🧩 Built with Flask, TensorFlow, and OpenCV

------------------------------------------------------------

## 🖼️ Sample Workflow

1. Upload a plant leaf image
2. The CNN model identifies the species
3. System provides:
   - Plant name
   - Medicinal uses
   - Safe usage guidance

------------------------------------------------------------

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Flask
- Deep Learning: TensorFlow, OpenCV
- Database: MySQL (for storing plant info)

------------------------------------------------------------

## 🧪 Model

The pre-trained model (plant_model.h5, ~250 MB) is included via Git LFS.
Make sure you have Git LFS installed before cloning:

    git lfs install
    git clone https://github.com/Sanz-03/Binomial-Recognition-Medicinal-Representation---CNN.git

------------------------------------------------------------

## 🧰 Installation

🔹 Clone the Repo

    git clone https://github.com/Sanz-03/Binomial-Recognition-Medicinal-Representation---CNN.git
    cd Binomial-Recognition-Medicinal-Representation---CNN

🔹 Install Requirements

Make sure you're in a virtual environment, then:

    pip install -r requirements.txt

------------------------------------------------------------

## ▶️ Run the App

    python server.py

Then open your browser and go to:

    http://127.0.0.1:5000

------------------------------------------------------------

## 📂 Folder Structure

    ├── model/                 # Contains plant_model.h5
    ├── static/                # CSS/JS assets
    ├── templates/             # HTML frontend (homepage, results)
    ├── sample data/           # Sample images (used for training/testing)
    ├── server.py              # Flask app
    ├── train_model.ipynb      # Training notebook
    ├── requirements.txt
    └── README.md

------------------------------------------------------------

## 👨‍🔬 Author

Sanjaiy PR  
GitHub: https://github.com/Sanz-03

------------------------------------------------------------

## 📜 License

This project is open-source under the MIT License.
