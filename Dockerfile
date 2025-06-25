# Multi-stage Dockerfile for Wireless Network Design Application
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python backend and serve the application
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
WORKDIR /app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend files to Flask static directory
COPY --from=frontend-builder /app/frontend/dist/ ./src/static/

# Create nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Serve static files directly with nginx \
    location /static/ { \
        alias /app/backend/src/static/; \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Proxy API requests to Flask \
    location /api/ { \
        proxy_pass http://127.0.0.1:3000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Serve React app for all other requests \
    location / { \
        proxy_pass http://127.0.0.1:3000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/sites-available/default

# Create supervisor configuration
RUN echo '[supervisord] \
nodaemon=true \
\
[program:nginx] \
command=nginx -g "daemon off;" \
autostart=true \
autorestart=true \
stderr_logfile=/var/log/nginx.err.log \
stdout_logfile=/var/log/nginx.out.log \
\
[program:flask] \
command=python src/main.py \
directory=/app/backend \
autostart=true \
autorestart=true \
stderr_logfile=/var/log/flask.err.log \
stdout_logfile=/var/log/flask.out.log \
environment=FLASK_ENV=production,FLASK_DEBUG=False' > /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 80

# Set environment variables
ENV FLASK_ENV=production
ENV FLASK_DEBUG=False
ENV PYTHONPATH=/app/backend

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start supervisor to manage nginx and flask
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

