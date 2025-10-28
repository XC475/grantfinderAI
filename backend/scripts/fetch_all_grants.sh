#!/bin/bash

# This script calls all grant fetching scripts and tracks errors

# Navigate to the backend directory
cd "$(dirname "$0")/.."

# Initialize a status variable
STATUS=0

# Run the fetch_grants_mass_dese.py script
echo "Running fetch_grants_mass_dese.py..."
python scripts/fetch_grants_mass_dese.py
if [ $? -ne 0 ]; then
  echo "Error: fetch_grants_mass_dese.py failed."
  STATUS=1
fi

# Run the fetch_grants_nysed.py script
echo "Running fetch_grants_nysed.py..."
python scripts/fetch_grants_nysed.py
if [ $? -ne 0 ]; then
  echo "Error: fetch_grants_nysed.py failed."
  STATUS=1
fi

# Run the fetch_grants_walmart.py script
echo "Running fetch_grants_walmart.py..."
python scripts/fetch_grants_walmart.py
if [ $? -ne 0 ]; then
  echo "Error: fetch_grants_walmart.py failed."
  STATUS=1
fi


# Run the fetch_grants_gov.py script
echo "Running fetch_grants_gov.py..."
python scripts/fetch_grants_gov.py
if [ $? -ne 0 ]; then
  echo "Error: fetch_grants_gov.py failed."
  STATUS=1
fi

# Run the update_expired_grants_status.py script
echo "Running update_expired_grants_status.py..."
python scripts/update_expired_grants_status.py --live
if [ $? -ne 0 ]; then
  echo "Error: update_expired_grants_status.py failed."
  STATUS=1
fi

# Final status
if [ $STATUS -ne 0 ]; then
  echo "One or more scripts failed."
  exit 1
else
  echo "All grant-fetching scripts executed successfully."
  exit 0
fi