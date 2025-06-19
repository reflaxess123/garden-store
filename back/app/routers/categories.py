from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db import models
from app.schemas import CategoryInDB
from typing import List, Optional
from sqlalchemy import select

router = APIRouter()

@router.get("/categories", response_model=List[CategoryInDB])
async def get_categories(
    slug: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    if slug and slug != "all":
        category = (await db.execute(select(models.Category).filter(models.Category.slug == slug))).scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return [category]
    
    categories = (await db.execute(select(models.Category))).scalars().all()
    return categories 