from flask import Flask, render_template, Response, stream_with_context, request, json, jsonify
from camera import VideoCamera
# from audio_get import *
import socket

app = Flask(__name__)
ip = '192.168.100.2:8080'


@app.route('/')
def index():
    text = "Camera Online"
    return render_template('bot.html', ip=ip, text=text)


@app.route('/feed', methods=['POST'])
def feed():
    global text
    feedback = text
    return json.dumps("feedback");


def gen(camera):
    try:
        while True:
            frame = camera.get_frame()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
    except:
        pass


@app.route('/video_feed')
def video_feed():
    return Response(gen(VideoCamera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


# Bot Controls
@app.route('/camerac1', methods=['GET', 'POST'])
def camerac1():
    print("Forward")
    data['dat'] = "Done"
    return jsonify(data)
    """
	    global er
	    s = socket.socket()         # Create a socket object
	    ##host = socket.gethostname() # Get local machine name
	    host="192.168.100.14"
	    port = 1234                # Reserve a port for your service.
	    s.connect((host, port))
	    ###print s.recv(1024)
	    inp="1"
	    s.send(str(inp))
	    d=s.recv(1024)
	    if d=="100":
		er="Obstacle in front"
	    elif d=="200":
		er="left collision"
	    elif d=="300":
		er="right collision"
	    s.close                     # Close the socket when done
	    #data = {}
	    #data['dat'] = inp
	    data={}
	    data['dat']=er
	    return jsonify(data)
	"""


@app.route('/camerac2', methods=['GET', 'POST'])
def camerac2():
    print("Left")
    data['dat'] = "Done"
    return jsonify(data)
    """
	    global er
	    s = socket.socket()         # Create a socket object
	    #host = socket.gethostname() # Get local machine name
	    host="192.168.100.14"
	    port = 1234                # Reserve a port for your service.
	    s.connect((host, port))
	    ##print s.recv(1024)
	    inp="4"
	    s.send(str(inp))
	    d=s.recv(1024)
	    if d=="100":
		er="Obstacle in front"
	    elif d=="200":
		er="left collision"
	    elif d=="300":
		er="right collision"
	    s.close                     # Close the socket when done
	    #data = {}
	    #data['dat'] = inp
	    data=er
	    print data
	    return jsonify(data)
	"""


@app.route('/camerac3', methods=['GET', 'POST'])
def camerac3():
    print("Right")
    data['dat'] = "Done"
    return jsonify(data)
    """
	    global er
	    s = socket.socket()         # Create a socket object
	    #host = socket.gethostname() # Get local machine name
	    host="192.168.100.14"
	    port = 1234                # Reserve a port for your service.
	    s.connect((host, port))
	    ##print s.recv(1024)
	    inp="3"
	    s.send(str(inp))
	    d=s.recv(1024)
	    if d=="100":
		er="Obstacle in front"
	    elif d=="200":
		er="left collision"
	    elif d=="300":
		er="right collision"
	    s.close                     # Close the socket when done
	    #data = {}
	    #data['dat'] = inp
	    data=er
	    print data
	    return jsonify(data)
	"""


@app.route('/camerac4', methods=['GET', 'POST'])
def camerac4():
    print("Reverse")
    data['dat'] = "Done"
    return jsonify(data)
    """
	    global er
	    s = socket.socket()         # Create a socket object
	    #host = socket.gethostname() # Get local machine name
	    host="192.168.100.14"
	    port = 1234                # Reserve a port for your service.
	    s.connect((host, port))
	    #print s.recv(1024)
	    inp="2"
	    s.send(str(inp))
	    d=s.recv(1024)
	    if d=="100":
		er="Obstacle in front"
	    elif d=="200":
		er="left collision"
	    elif d=="300":
		er="right collision"
	    s.close                     # Close the socket when done
	    #data = {}
	    #data['dat'] = inp
	    data=er
	    print data
	    return jsonify(data)
	"""


@app.route('/camerac5', methods=['GET', 'POST'])
def camerac5():
    print("Stop")
    data['dat'] = "Done"
    return jsonify(data)
    """
	    global er
	    s = socket.socket()         # Create a socket object
	    #host = socket.gethostname() # Get local machine name
	    host="192.168.100.14"
	    port = 1234                # Reserve a port for your service.
	    s.connect((host, port))
	    #print s.recv(1024)
	    inp="5"
	    s.send(str(inp))
	    d=s.recv(1024)
	    if d=="100":
		er="Obstacle in front"
	    elif d=="200":
		er="left collision"
	    elif d=="300":
		er="right collision"
	    s.close                     # Close the socket when done
	    #data = {}
	    #data['dat'] = inp
	    data=er
	    print data
	    return jsonify(data)
	"""


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5050)
