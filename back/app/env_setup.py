import os

from dotenv import load_dotenv

# Грузим .env из папки back
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
