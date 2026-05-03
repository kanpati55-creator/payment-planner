FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Webアプリとして公開するための実行コマンド
CMD ["flet", "run", "--web", "--port", "8080", "payment_planner.py"]
