FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# fletコマンドを使わず、直接Pythonを実行する
CMD ["python", "payment_planner.py"]
