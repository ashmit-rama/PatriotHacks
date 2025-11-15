FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (optional but helps avoid SSL issues)
RUN apt-get update && apt-get install -y build-essential && apt-get clean

# Copy requirements FIRST (optimizes Docker caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run the backend server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
