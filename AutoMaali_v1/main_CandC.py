from flask import Flask, render_template            
from subprocess import check_output

x=check_output(['hostname', '-I'])
ip=x.split()
ipaddr=ip[0]
print ipaddr 

app = Flask(__name__)
@app.route('/')
def index():
	return render_template('combined_bot.html',ipaddr=ipaddr)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=4040)
