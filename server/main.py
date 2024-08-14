from flask import Flask, request, jsonify,send_file
from flask_cors import CORS
from pymongo import MongoClient
from gridfs import GridFS
from bson import json_util

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['Music']
musicCol=db['media']

gridfs = GridFS(db)


@app.route('/')
def hello():
    return "Hello World"

@app.route('/upload', methods=['POST'])
def upload_file():
    # Get the file from the request
    file = request.files['file']
    print(file)
    gridfs.put(file, filename=file.filename)
    return jsonify({'message': 'File uploaded successfully'})


@app.route('/get-music-list', methods=['GET'])
def download_file():
    # Get the file from MongoDB
    files = db.fs.files.find()
    print(files)
    if files:
        return json_util.dumps(files)
    else:
        return 'File not found', 404



@app.route('/api/music/<filename>', methods=['GET'])
def get_music(filename):
    file = gridfs.find_one({'filename': filename})
    if file:
        return send_file(file, mimetype='audio/mpeg')
    else:
        return 'File not found', 404

app.run(debug=True)
