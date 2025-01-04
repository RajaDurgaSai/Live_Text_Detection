
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import logging
from mongoengine.errors import NotUniqueError
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import pytesseract
from imutils.object_detection import non_max_suppression
import cv2
import numpy as np
import datetime
from mongoengine import Document, StringField, connect
from box_extractor import box_extractor
from flask_cors import CORS
from flask_mail import Mail, Message
import random
import string
from gevent.pywsgi import WSGIServer

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize JWTManager
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient("mongodb+srv://sai:sai147.k@cluster0.gq2sdzw.mongodb.net/text_detection_db?retryWrites=true&w=majority")
db = client['text_detection_db']
collection = db['detections']

# Connect mongoengine to the MongoDB database
connect(db='text_detection_db', host="mongodb+srv://sai:sai147.k@cluster0.gq2sdzw.mongodb.net/text_detection_db?retryWrites=true&w=majority")

# Setting up tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load EAST text detector model
east_model_path = 'frozen_east_text_detection.pb'
net = cv2.dnn.readNet(east_model_path)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'gomparamana29@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'ogtv neyl umus xrkv'  # Replace with your app-specific password
app.config['MAIL_DEFAULT_SENDER'] = 'gomparamana29@gmail.com'  # Replace with your email
mail = Mail(app)

# Define MongoDB document schema using mongoengine
class User(Document):
    email = StringField(required=True, unique=True)
    username = StringField(required=True)
    password = StringField(required=True)
    reset_token = StringField()

# Register endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    logging.info(f"Received registration data: {data}")

    if not (email and password and username):
        logging.error("Missing required fields")
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        hashed_password = generate_password_hash(password)
        user = User(email=email, username=username, password=hashed_password)
        user.save()
        logging.info("User registered successfully")
        return jsonify({'message': 'User registered successfully'}), 201
    except NotUniqueError:
        logging.error("Email or username already exists")
        return jsonify({'error': 'Email or username already exists'}), 400
    except Exception as e:
        logging.error(f'Error during registration: {str(e)}')
        return jsonify({'error': str(e)}), 500

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not (email and password):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        user = User.objects(email=email).first()

        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=str(user.id))
            return jsonify({'access_token': access_token, 'username': user.username}), 200
        else:
            logging.error(f'Invalid login attempt for user {email}')
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logging.error(f'Error during login: {str(e)}')
        return jsonify({'error': str(e)}), 500

def generate_reset_token(length=6):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(length))

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        user = User.objects(email=email).first()
        if not user:
            logging.error('Email not found: %s', email)
            return jsonify({'error': 'Email not found'}), 404

        reset_token = generate_reset_token()
        user.reset_token = reset_token
        user.save()

        msg = Message('Password Reset Request', recipients=[email])
        msg.body = f'Your password reset token is: {reset_token}'
        mail.send(msg)

        return jsonify({'message': 'Password reset email sent'})
    except Exception as e:
        logging.error('Error in forgot_password: %s', str(e))
        return jsonify({'error': 'An internal server error occurred.'}), 500

@app.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')

        user = User.objects(email=email).first()
        if not user or user.reset_token != reset_token:
            logging.error('Invalid email or reset token: %s', email)
            return jsonify({'error': 'Invalid email or reset token'}), 400

        user.password = generate_password_hash(new_password)
        user.reset_token = None
        user.save()

        return jsonify({'message': 'Password has been reset'})
    except Exception as e:
        logging.error('Error in reset_password: %s', str(e))
        return jsonify({'error': 'An internal server error occurred.'}), 500

# Text detection endpoint
@app.route('/detect_text', methods=['POST'])
def detect_text():
    try:
        data = request.files['frame'].read()
        nparr = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Parameters for text detection
        min_confidence = 0.5
        new_w, new_h = 320, 320
        padding = 0.1  # Adjust padding as needed

        layer_names = ['feature_fusion/Conv_7/Sigmoid', 'feature_fusion/concat_3']

        orig = frame.copy()
        orig_h, orig_w = orig.shape[:2]
        h, w = frame.shape[:2]
        ratio_w = orig_w / float(new_w)
        ratio_h = orig_h / float(new_h)

        frame_resized = cv2.resize(frame, (new_w, new_h))
        blob = cv2.dnn.blobFromImage(frame_resized, 1.0, (new_w, new_h), (123.68, 116.78, 103.94), swapRB=True, crop=False)
        net.setInput(blob)
        scores, geometry = net.forward(layer_names)
        rectangles, confidences = box_extractor(scores, geometry, min_confidence=min_confidence)
        boxes = non_max_suppression(np.array(rectangles), probs=confidences)
        results = []

        for (start_x, start_y, end_x, end_y) in boxes:
            start_x = int(start_x * ratio_w)
            start_y = int(start_y * ratio_h)
            end_x = int(end_x * ratio_w)
            end_y = int(end_y * ratio_h)
            dx = int((end_x - start_x) * padding)
            dy = int((end_y - start_y) * padding)
            start_x = max(0, start_x - dx)
            start_y = max(0, start_y - dy)
            end_x = min(orig_w, end_x + (dx * 2))
            end_y = min(orig_h, end_y + (dy * 2))
            roi = orig[start_y:end_y, start_x:end_x]
            config = '-l eng --oem 1 --psm 7'
            text = pytesseract.image_to_string(roi, config=config)
            results.append({
                'text': text,
                'bbox': [start_x, start_y, end_x, end_y]
            })

            # Store result in MongoDB
            detection = {
                'text': text,
                'bbox': [start_x, start_y, end_x, end_y],
                'timestamp': datetime.datetime.utcnow()
            }
            collection.insert_one(detection)

        return jsonify(results)

    except Exception as e:
        logging.error(f'Error during text detection: {str(e)}')
        return jsonify({'error': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
