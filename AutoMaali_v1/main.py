from flask import Flask, render_template, Response,stream_with_context,request,json,jsonify
from camera import VideoCamera
#from audio_get import *
import socket               # Import socket module

app = Flask(__name__)
ip='192.168.100.3:8080'

global text
global er
er=""
@app.route('/')
def index():
    return render_template('index.html',ip=ip,er=er)


@app.route('/bot')
def bot():
    return render_template('bot.html',ip=ip)

@app.route('/feed', methods=['POST'])
def feed():
	global text
	feedback=text
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
    
@app.route('/camerac1', methods=['GET', 'POST'])
def camerac1():
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

@app.route('/camerac2', methods=['GET', 'POST'])
def camerac2():
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

@app.route('/camerac3', methods=['GET', 'POST'])
def camerac3():
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

@app.route('/camerac4', methods=['GET', 'POST'])
def camerac4():
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

@app.route('/camerac5', methods=['GET', 'POST'])
def camerac5():
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

@app.route('/botc1', methods=['GET', 'POST'])
def botc1():
    global er
    #inp=request.form['botc']
    s = socket.socket()         # Create a socket object
    #host = socket.gethostname() # Get local machine name
    host="192.168.100.14"
    port = 1234                # Reserve a port for your service.
    s.connect((host, port))
    #print s.recv(1024)
    inp='8'
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

@app.route('/botc2', methods=['GET', 'POST'])
def botc2():
    global er
    #inp=request.form['botc']
    s = socket.socket()         # Create a socket object
    #host = socket.gethostname() # Get local machine name
    host="192.168.100.14"
    port = 1234                # Reserve a port for your service.
    s.connect((host, port))
    #print s.recv(1024)
    inp='6'
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

@app.route('/botc3', methods=['GET', 'POST'])
def botc3():
    global er
    #inp=request.form['botc']
    s = socket.socket()         # Create a socket object
    #host = socket.gethostname() # Get local machine name
    host="192.168.100.14"
    port = 1234                # Reserve a port for your service.
    s.connect((host, port))
    #print s.recv(1024)
    inp='7'
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

@app.route('/botc4', methods=['GET', 'POST'])
def botc4():
    global er
    #inp=request.form['botc']
    s = socket.socket()         # Create a socket object
    #host = socket.gethostname() # Get local machine name
    host="192.168.100.14"
    port = 1234                # Reserve a port for your service.
    s.connect((host, port))
    #print s.recv(1024)
    inp='9'
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

@app.route('/botc5', methods=['GET', 'POST'])
def botc5():
    global er
    #inp=request.form['botc']
    s = socket.socket()         # Create a socket object
    #host = socket.gethostname() # Get local machine name
    host="192.168.100.14"
    port = 1234                # Reserve a port for your service.
    s.connect((host, port))
    #print s.recv(1024)
    inp='0'
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)