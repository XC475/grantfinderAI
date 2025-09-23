"""
Main runner script that orchestrates all grant collection scripts
This script can be run manually or by GitHub Actions
"""

import sys
import os
import logging
from datetime import datetime

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import db_manager
from config.settings import config
from sqlalchemy import text

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def run_grants_gov_scraper():
    """Run the grants.gov scraper"""
    try:
        from fetch_grants_gov import main as fetch_grants_gov_main
        logger.info("Starting grants.gov scraper...")
        fetch_grants_gov_main()
        logger.info("Grants.gov scraper completed successfully")
        return True
    except Exception as e:
        logger.error(f"Grants.gov scraper failed: {e}")
        return False

def run_mass_dese_scraper():
    """Run the Mass DESE scraper"""
    try:
        from fetch_grants_mass_dese import main as fetch_mass_dese_main
        logger.info("Starting Mass DESE scraper...")
        fetch_mass_dese_main()
        logger.info("Mass DESE scraper completed successfully")
        return True
    except Exception as e:
        logger.error(f"Mass DESE scraper failed: {e}")
        return False

def get_collection_summary():
    """Get a summary of the collection results"""
    try:
        with db_manager.get_session() as session:
            # Get total grants
            total_result = session.execute(text("SELECT COUNT(*) as count FROM opportunities")).fetchone()
            total_grants = total_result[0] if total_result else 0
            
            # Get grants added today
            today_result = session.execute(text("""
                SELECT COUNT(*) as count FROM opportunities 
                WHERE DATE(post_date) = CURRENT_DATE
            """)).fetchone()
            today_grants = today_result[0] if today_result else 0
            
            # Get grants by source
            source_result = session.execute(text("""
                SELECT source, COUNT(*) as count 
                FROM opportunities 
                GROUP BY source
            """)).fetchall()
            
            return {
                'total_grants': total_grants,
                'grants_added_today': today_grants,
                'grants_by_source': dict(source_result) if source_result else {}
            }
    except Exception as e:
        logger.error(f"Error getting collection summary: {e}")
        return {'error': str(e)}

def main():
    """Main function to run all grant collection processes"""
    logger.info("=== Starting Grant Collection Process ===")
    start_time = datetime.now()
    
    # Test database connection
    if not db_manager.test_connection():
        logger.error("Database connection failed. Exiting.")
        return False
    
    success_count = 0
    total_scrapers = 2
    
    # Run grants.gov scraper
    if run_grants_gov_scraper():
        success_count += 1
    
    # Run Mass DESE scraper  
    if run_mass_dese_scraper():
        success_count += 1
    
    # Generate summary
    summary = get_collection_summary()
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    logger.info(f"=== Grant Collection Complete ===")
    logger.info(f"Duration: {duration:.2f} seconds")
    logger.info(f"Successful scrapers: {success_count}/{total_scrapers}")
    logger.info(f"Collection summary: {summary}")
    
    # Return success status
    return success_count == total_scrapers

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
