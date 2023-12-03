from flask import Flask, render_template, send_file, jsonify
import base64
import cv2
import numpy as np
from io import BytesIO
from flask_socketio import SocketIO, emit

# API Setting
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
app.template_folder = 'static/views'
app.static_folder = 'static'

@app.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'API IS WORKING'})

@app.route('/page/<page>')
def page(page):
    return render_template(page + '.html')

@app.route('/images/<image_name>')
def getImage(image_name):
    return send_file('static/images/' + image_name)

@socketio.on('frame')
def handle_frame(data):
    image_data = data['image']
    # Decode the image from base64
    image_data = base64.b64decode(image_data.split(',')[1])
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert the image to grayscale
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Encode the grayscale image back to a format suitable for transmission
    _, buffer = cv2.imencode('.jpg', gray_img)
    io_buf = BytesIO(buffer)

    # Convert to base64 for WebSocket transmission
    gray_image_base64 = base64.b64encode(io_buf.getvalue()).decode('utf-8')

    emit('response', {'image': 'data:image/jpeg;base64,' + gray_image_base64})

def main():
    socketio.run(app, debug=True, port=5099)

if __name__ == '__main__':
    main()
