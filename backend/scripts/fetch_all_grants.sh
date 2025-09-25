#!/bin/bash

# This script calls all grant fetching scripts

# Navigate to the backend directory
cd "$(dirname "$0")/.."

# Run the fetch_grants_mass_dese.py script
echo "Running fetch_grants_mass_dese.py..."
python scripts/fetch_grants_mass_dese.py

# Run the fetch_grants_gov.py script
echo "Running fetch_grants_gov.py..."
python scripts/fetch_grants_gov.py

echo "All grant-fetching scripts executed successfully."