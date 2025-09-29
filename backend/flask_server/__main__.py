# flask_server/__main__.py
from flask_server import create_app


def main():
    flask_app = create_app()
    flask_app.run(port=8080)


if __name__ == "__main__":
    main()
