# Multi-stage Dockerfile for Google Cloud Run deployment
FROM python:3.11-slim as base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install system geospatial libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY contracts/ ./contracts/
COPY . ./

EXPOSE 8080

# Serve with production Uvicorn or static web worker
CMD ["uvicorn", "backend.gemini_orchestrator:app", "--host", "0.0.0.0", "--port", "8080"]
