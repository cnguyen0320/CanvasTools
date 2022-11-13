import flask
from requests import get


app = flask.Flask(__name__)

@app.route('/proxy/<path:path>', methods=['GET', 'POST'])
def proxy(path):

    # put the authorization back into the proxy header
    reform_headers = {"Authorization": flask.request.headers.get("Authorization")}

    # differentiate between POST and GET
    if flask.request.method == "POST":
        pass
    else:
        result = get(f'{path}?{flask.request.query_string.decode()}', headers=reform_headers)

    return result.json()

@app.route("/")
def home():
    return flask.render_template("index.html")



if __name__ == '__main__':
    app.run()