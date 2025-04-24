FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port the app will run on
EXPOSE 7346

CMD ["gunicorn", "--workers=1", "--threads=1", "--bind=0.0.0.0:1337", "server:app"]