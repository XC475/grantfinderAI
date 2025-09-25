# flask_server/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from .db import db
from dotenv import load_dotenv

migrate = Migrate()

load_dotenv()

def create_app():
    """Create Flask app."""
    app = Flask(__name__)

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        host = os.getenv("DB_HOST")
        port = os.getenv("DB_PORT", "5432")
        name = os.getenv("DB_NAME")
        if user and password and host and name:
            db_url = f"postgresql://{user}:{password}@{host}:{port}/{name}"
        else:
            db_url = "sqlite:///data.db"
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from models_sql import Opportunity, Agency, CFDAProgram
    migrate.init_app(app, db)

    return app
