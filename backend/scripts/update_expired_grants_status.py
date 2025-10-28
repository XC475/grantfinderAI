#!/usr/bin/env python3
"""
Update Expired Grants Status Script

This script finds grants that are currently posted or forecasted but have passed
their close dates, and updates their status to either 'closed' or 'archive'
based on the archive date.

Logic:
- Find opportunities with status 'posted' or 'forecasted'
- Check if close_date has passed
- If archive_date exists and has passed: set status to 'archive'
- Otherwise: set status to 'closed'
"""

import os
import sys
from datetime import datetime, date
from dotenv import load_dotenv

# Add the parent directory to the path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql.opportunity import Opportunity, OpportunityStatusEnum

# Load environment variables
load_dotenv()


def update_expired_grants(dry_run: bool = True) -> dict:
    """
    Update the status of grants that have passed their close dates.

    Args:
        dry_run: If True, only show what would be updated without making changes

    Returns:
        Dict with statistics about what was updated
    """
    stats = {
        "total_checked": 0,
        "expired_found": 0,
        "set_to_closed": 0,
        "set_to_archive": 0,
        "errors": 0,
        "grants_updated": [],
    }

    today = date.today()
    print(f"📅 Checking for expired grants as of {today}")
    print(f"🔍 Mode: {'DRY RUN' if dry_run else 'LIVE UPDATE'}")
    print("=" * 60)

    try:
        # Query for opportunities that are posted or forecasted
        active_opportunities = (
            db.session.query(Opportunity)
            .filter(
                Opportunity.status.in_(
                    [OpportunityStatusEnum.posted, OpportunityStatusEnum.forecasted]
                )
            )
            .all()
        )

        stats["total_checked"] = len(active_opportunities)
        print(
            f"📊 Found {len(active_opportunities)} active opportunities (posted/forecasted)"
        )

        if not active_opportunities:
            print("✅ No active opportunities found to check")
            return stats

        for opportunity in active_opportunities:
            try:
                # Check if close_date has passed
                if opportunity.close_date and opportunity.close_date < today:
                    stats["expired_found"] += 1
                    old_status = opportunity.status.value
                    new_status = None

                    # Determine new status based on archive_date
                    if opportunity.archive_date and opportunity.archive_date < today:
                        # Archive date has passed, set to archive
                        new_status = OpportunityStatusEnum.archive
                        stats["set_to_archive"] += 1
                        reason = f"archive date ({opportunity.archive_date}) has passed"
                    else:
                        # No archive date or archive date hasn't passed, set to closed
                        new_status = OpportunityStatusEnum.closed
                        stats["set_to_closed"] += 1
                        reason = f"close date ({opportunity.close_date}) has passed"

                    grant_info = {
                        "id": opportunity.id,
                        "title": opportunity.title[:60] + "..."
                        if len(opportunity.title) > 60
                        else opportunity.title,
                        "source": opportunity.source,
                        "close_date": str(opportunity.close_date),
                        "archive_date": str(opportunity.archive_date)
                        if opportunity.archive_date
                        else None,
                        "old_status": old_status,
                        "new_status": new_status.value,
                        "reason": reason,
                    }

                    stats["grants_updated"].append(grant_info)

                    print(f"🔄 Grant {opportunity.id}: {grant_info['title']}")
                    print(f"   Source: {opportunity.source}")
                    print(f"   Close Date: {opportunity.close_date}")
                    print(f"   Archive Date: {opportunity.archive_date or 'None'}")
                    print(f"   Status: {old_status} → {new_status.value} ({reason})")

                    if not dry_run:
                        opportunity.status = new_status
                        opportunity.last_updated = datetime.utcnow()
                        print("   ✅ Updated in database")
                    else:
                        print("   🔍 Would update (dry run)")

                    print()

            except Exception as e:
                stats["errors"] += 1
                print(f"❌ Error processing opportunity {opportunity.id}: {e}")

        if not dry_run and stats["expired_found"] > 0:
            # Commit all changes
            db.session.commit()
            print(f"💾 Committed {stats['expired_found']} status updates to database")

    except Exception as e:
        print(f"❌ Database error: {e}")
        if not dry_run:
            db.session.rollback()
        stats["errors"] += 1

    return stats


def print_summary(stats: dict, dry_run: bool):
    """Print a summary of the update operation."""
    print("=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE UPDATE'}")
    print(f"Total opportunities checked: {stats['total_checked']}")
    print(f"Expired grants found: {stats['expired_found']}")
    print(f"Set to 'closed': {stats['set_to_closed']}")
    print(f"Set to 'archive': {stats['set_to_archive']}")
    print(f"Errors encountered: {stats['errors']}")

    if stats["grants_updated"]:
        print("\n📝 Detailed updates:")
        for grant in stats["grants_updated"]:
            print(
                f"  • {grant['id']}: {grant['title']} ({grant['old_status']} → {grant['new_status']})"
            )


def main():
    """Main function to handle command line arguments and run the update."""
    import argparse

    parser = argparse.ArgumentParser(description="Update expired grant statuses")
    parser.add_argument(
        "--live", action="store_true", help="Perform live updates (default is dry run)"
    )
    parser.add_argument(
        "--force", action="store_true", help="Skip confirmation prompt for live updates"
    )

    args = parser.parse_args()

    # Create Flask app context
    flask_app = server.create_app()

    with flask_app.app_context():
        if args.live:
            if not args.force:
                print("⚠️  You are about to perform LIVE updates to the database.")
                print("This will modify grant statuses for expired opportunities.")
                confirm = (
                    input("Are you sure you want to continue? (yes/no): ")
                    .lower()
                    .strip()
                )

                if confirm not in ["yes", "y"]:
                    print("❌ Update cancelled by user")
                    return

            print("🚀 Running LIVE update...")
            stats = update_expired_grants(dry_run=False)
        else:
            print("🔍 Running DRY RUN (use --live for actual updates)...")
            stats = update_expired_grants(dry_run=True)

        print_summary(stats, dry_run=not args.live)

        if not args.live and stats["expired_found"] > 0:
            print("\n💡 To apply these changes, run:")
            print(f"   python {os.path.basename(__file__)} --live")


if __name__ == "__main__":
    main()
