import flask
from requests import get

__DEBUG = True

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

    if __DEBUG:
        print(result.content)

    return result.content

def home():
    return flask.render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True)