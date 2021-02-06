from flask import Flask, render_template, redirect, request, session
from gevent.pywsgi import WSGIServer
from redis import StrictRedis
import utils
import os
from utils import File
import time
from PIL import Image
import markdown
import psutil


app = Flask(__name__, static_url_path='')
app.config["SECRET_KEY"] = 'TPmi4aLWRbyVq8zu9v82dWYW1'


@app.before_request
def before_user():
    paths = request.path.split('/')

    if request.path == "/" or request.path == "/login":
        return None
    if request.path.startswith("/static"):
        return None
    if len(paths) > 2 and paths[2] == 'cloudpan':
        if paths[1] == 'public' or (session.get('username') != None and paths[1] in session.get('username')):
            return None
        else:
            return redirect("/")


@app.route('/')
def index():
    return render_template('/index.html', form=request.form)


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if username == '' or password == '':
        return render_template('/index.html', passwordFalse=True)
    password = utils.encrypt(password)
    redis = StrictRedis(host='localhost', port=6379, db=0, password='password')
    realPassword = redis.hget('userHash', username).decode('utf-8')
    if realPassword == password:
        session['username'] = username
        return redirect('/'+username+'/cloudpan/')
    return render_template('/index.html', passwordFalse=True)


@app.route('/<username>/cloudpan/')
def showCloudPan(username):
    basePath = utils.basePath+username+'/'
    if not os.path.exists(basePath):
        os.makedirs(basePath)
    filesname = os.listdir(basePath)
    files = []

    for filename in filesname:

        relativePath = basePath+filename
        savedate = time.localtime(os.path.getmtime(relativePath))
        if savedate.tm_year == time.localtime(time.time()).tm_year and savedate.tm_yday == time.localtime(time.time()).tm_yday:
            savedate = time.strftime('今天 %H:%M', savedate)
        else:
            savedate = time.strftime('%Y/%m/%d %H:%M', savedate)
        filesize = os.path.getsize(relativePath)
        sizeUnits = ['B', 'KB', 'MB', 'GB', 'TB']
        sizeUnitsIndex = 0
        while filesize > 300:
            filesize /= 1024
            sizeUnitsIndex += 1

        filesize = '%.2f %s' % (filesize, sizeUnits[sizeUnitsIndex])
        files.append(
            File(filename, savedate, filesize)
        )

    if request.args.get('success') == 'True':
        success = True
    else:
        success = False

    return render_template('cloudpan.html', username=username, files=files, success=success)


@app.route('/<username>/cloudpan/upload', methods=['post'])
def uploadFile(username):
    basePath = utils.basePath+username+'/'

    file = request.files['file']
    if file.filename in os.listdir(basePath):
        return 'Existed'
    file.save(open(basePath+file.filename, 'wb'))
    print('"%s" upload file "%s"' % (username, file.filename))
    return 'Success'


@app.route('/<username>/cloudpan/download/<filename>')
def download(username, filename):
    path = utils.basePath+username+'/'+filename
    print('"%s" download file "%s"' % (username, filename))

    return open(path, 'rb').read()


@app.route('/<username>/cloudpan/delete/<filename>')
def delete(username, filename):
    path = utils.basePath+username+'/'+filename
    os.remove(path)
    print('"%s" delete file "%s"' % (username, filename))
    return redirect('/'+username+"/cloudpan")


@app.route('/<username>/cloudpan/read_text/<filename>', methods=['post'])
def readText(username, filename: str):
    basePath = utils.basePath+username+'/'+filename

    if filename.split('.')[-1] == 'md' or filename.split('.')[-1] == 'markdown':
        file = open(basePath, 'r', encoding='utf-8')
        content = file.read()
        content = markdown.markdown(content, extensions=['fenced_code'])
    else:
        file = open(basePath, 'rb')
        content = file.read()
    file.close()
    return content


@app.route('/<username>/cloudpan/read_image/<filename>')
def readImage(username, filename):
    return readText(username, filename)


@app.route('/<username>/cloudpan/read_image_shape/<filename>', methods=['post'])
def getImageShape(username, filename):
    basePath = utils.basePath+username+'/'+filename
    im = Image.open(basePath)  # 返回一个Image对象
    return str(im.size[0]) + 'x' + str(im.size[1])


@app.route('/cloudpan/disk_space', methods=['post'])
def getDiskSpace():
    total = psutil.disk_usage(utils.basePath).total
    used = psutil.disk_usage(utils.basePath).used
    return str(used)+'/'+str(total)


if __name__ == '__main__':
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
    app.run(host='0.0.0.0')
