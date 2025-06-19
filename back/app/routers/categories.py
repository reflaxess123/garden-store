from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.schemas import CategoryInDB
from typing import List, Optional

router = APIRouter()

@router.get("/categories", response_model=List[CategoryInDB])
async def get_categories(
    slug: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    if slug and slug != "all":
        category = db.query(models.Category).filter(models.Category.slug == slug).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return [category]
    
    categories = db.query(models.Category).all()
    return categories 