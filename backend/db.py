# backend/db.py
"""Database management
Handles connection, session management, and table creation
"""
import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), 'config', '.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '6543')
DB_NAME = os.getenv('DB_NAME')

# Construct DATABASE_URL from components if available, otherwise use direct URL
if all([DB_USER, DB_PASSWORD, DB_HOST, DB_NAME]):
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    logger.info(f"Using Supabase database: {DB_HOST}")
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/grantfinder_ai")
    logger.info("Using fallback database URL")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL, 
    echo=False, 
    future=True,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class DatabaseManager:
    """Database manager for handling sessions and connections"""
    
    @staticmethod
    @contextmanager
    def get_session():
        """Context manager for database sessions"""
        session = SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
    
    @staticmethod
    def create_tables():
        """Create all tables"""
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            raise
    
    @staticmethod
    def test_connection():
        """Test database connection"""
        try:
            with DatabaseManager.get_session() as session:
                session.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
        except Exception as e:
            if "Connection refused" in str(e):
                logger.error("Database connection failed: PostgreSQL server is not running or not accessible")
                logger.error("Please check that PostgreSQL is installed and running, and verify your DATABASE_URL")
            else:
                logger.error(f"Database connection failed: {e}")
            return False

# Global database manager instance
db_manager = DatabaseManager()
