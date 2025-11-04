#!/usr/bin/env python3
"""
Script to update all opportunities in the database to mark them as k12_education services.
This script adds 'k12_education' to the services array for all opportunities.
"""

import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask_server import create_app
from flask_server.db import db
from models_sql.opportunity import Opportunity
from sqlalchemy import text


def update_opportunities_services(dry_run=True):
    """
    Update all opportunities to include 'k12_education' in their services array.

    Args:
        dry_run (bool): If True, only show what would be updated without making changes
    """
    app = create_app()

    with app.app_context():
        try:
            # Get count of opportunities that need updating
            total_opportunities = db.session.query(Opportunity).count()

            # Count opportunities that already have k12_education in services
            try:
                already_updated = (
                    db.session.query(Opportunity)
                    .filter(
                        Opportunity.services.op("&&")(
                            text("ARRAY['k12_education']::opportunity_services_enum[]")
                        )
                    )
                    .count()
                )
            except Exception as e:
                print(f"Note: services column may not exist yet: {e}")
                already_updated = 0

            # Count opportunities that need updating
            need_updating = total_opportunities - already_updated

            print(f"Total opportunities: {total_opportunities}")
            print(f"Already have k12_education in services: {already_updated}")
            print(f"Need updating: {need_updating}")

            if need_updating == 0:
                print("All opportunities already have k12_education in services!")
                return

            if dry_run:
                print("\n--- DRY RUN MODE ---")
                print("The following changes would be made:")

                # Show opportunities that would be updated
                try:
                    opportunities_to_update = (
                        db.session.query(Opportunity)
                        .filter(
                            ~Opportunity.services.op("&&")(
                                text(
                                    "ARRAY['k12_education']::opportunity_services_enum[]"
                                )
                            )
                        )
                        .limit(10)
                        .all()
                    )
                except Exception:
                    # If services column doesn't exist, get first 10 opportunities
                    opportunities_to_update = (
                        db.session.query(Opportunity).limit(10).all()
                    )

                for i, opp in enumerate(opportunities_to_update):
                    current_services = getattr(opp, "services", None) or []
                    new_services = list(set(current_services + ["k12_education"]))
                    print(f"ID {opp.id}: {current_services} -> {new_services}")
                    if i >= 9:  # Show first 10
                        break

                if need_updating > 10:
                    print(f"... and {need_updating - 10} more opportunities")

                print("\nTo actually apply these changes, run:")
                print("python scripts/update_opportunities_services.py --apply")

            else:
                print("\n--- APPLYING CHANGES ---")

                # Update all opportunities to include k12_education in services
                # Use raw SQL for efficient bulk update
                update_query = text("""
                    UPDATE opportunities 
                    SET services = CASE 
                        WHEN services IS NULL THEN ARRAY['k12_education']::opportunity_services_enum[]
                        WHEN NOT (services && ARRAY['k12_education']::opportunity_services_enum[]) THEN 
                            array_append(services, 'k12_education'::opportunity_services_enum)
                        ELSE services
                    END
                    WHERE services IS NULL OR NOT (services && ARRAY['k12_education']::opportunity_services_enum[])
                """)

                result = db.session.execute(update_query)
                db.session.commit()

                print(f"Successfully updated {result.rowcount} opportunities!")

                # Verify the update
                final_count = (
                    db.session.query(Opportunity)
                    .filter(
                        Opportunity.services.op("&&")(
                            text("ARRAY['k12_education']::opportunity_services_enum[]")
                        )
                    )
                    .count()
                )

                print(
                    f"Verification: {final_count} opportunities now have k12_education in services"
                )

        except Exception as e:
            print(f"Error updating opportunities: {e}")
            db.session.rollback()
            raise


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Update all opportunities to include k12_education in services"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually apply the changes (default is dry-run mode)",
    )

    args = parser.parse_args()

    # Run in dry-run mode by default, unless --apply is specified
    dry_run = not args.apply

    if dry_run:
        print("Running in DRY-RUN mode. No changes will be made.")
        print("Use --apply flag to actually make changes.")
    else:
        print("Running in APPLY mode. Changes will be made to the database.")

    print("-" * 60)

    update_opportunities_services(dry_run=dry_run)
