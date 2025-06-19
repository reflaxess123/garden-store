import app.env_setup
from fastapi import FastAPI
import os
import psycopg2
import redis
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware

# Импорт роутеров
from app.routers import auth, admin, cart, categories, products

# Загружаем переменные окружения из .env, который лежит рядом с main.py
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
print("DATABASE_URL:", os.getenv("DATABASE_URL"))
print("REDIS_URL:", os.getenv("REDIS_URL"))

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000", # Next.js frontend
    "http://127.0.0.1:3000",
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(products.router, prefix="/api")

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
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=4000, reload=True)

# Удален блок if __name__ == "__main__":
# Пользователь будет запускать сервер FastAPI вручную. 