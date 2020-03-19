from flask import Flask, render_template, Response, stream_with_context, request, json, jsonify
from camera import VideoCamera
# from audio_get import *
import socket
# import RPi.GPIO as GPIO
import time
from pyHS100 import Discover
from pyHS100 import SmartPlug, SmartBulb
from pprint import pformat as pf

data = [""]
app = Flask(__name__)
ip = "192.168.1.36"


@app.route('/')
def index():
    text = "Bot Controls"
    return render_template('controls.html', ip=ip, text=text)


# Bot Controls
@app.route('/camerac1', methods=['GET', 'POST'])
def camerac1():
    plug = SmartPlug("Insert IP Address here")
    print("Current state: %s" % plug.state)
    if (plug.state == 'ON'):
        plug.turn_off()
    else:
        plug.turn_on()

    return jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=6060)
