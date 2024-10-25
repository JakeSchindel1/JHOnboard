#!/bin/bash

# Create a deployment directory
mkdir -p deployment

# Install dependencies to deployment directory
pip install --target ./deployment -r requirements.txt

# Copy your application code
cp main.py ./deployment/

# Create deployment package
cd deployment
zip -r ../lambda_function.zip .
cd ..