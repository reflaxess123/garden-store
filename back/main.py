from fastapi import FastAPI
import os
import psycopg2
import redis
from dotenv import load_dotenv
import uvicorn

# Загружаем переменные окружения из .env файла
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI()

@app.get("/health")
async def health_check():
    db_status = "unknown"
    redis_status = "unknown"

    # Тест подключения к PostgreSQL
    try:
        # Используем DATABASE_URL напрямую
        db_url = os.getenv("DATABASE_URL")
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        print("PostgreSQL: подключение успешно!")
        db_status = "OK"
    except Exception as e:
        db_status = f"Error: {e}"

    # Тест подключения к Redis
    try:
        # Используем REDIS_URL напрямую
        redis_url = os.getenv("REDIS_URL")
        r = redis.from_url(redis_url)
        r.ping()
        print("Redis: подключение успешно!")
        redis_status = "OK"
    except Exception as e:
        redis_status = f"Error: {e}"

    return {"database": db_status, "redis": redis_status}

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=4000, reload=True) 