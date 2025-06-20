/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import type { ProductCreateDescription } from './productCreateDescription';
import type { ProductCreatePrice } from './productCreatePrice';
import type { ProductCreateDiscount } from './productCreateDiscount';
import type { ProductCreateCharacteristics } from './productCreateCharacteristics';
import type { ProductCreateImageUrl } from './productCreateImageUrl';

export interface ProductCreate {
  name: string;
  slug: string;
  description?: ProductCreateDescription;
  price: ProductCreatePrice;
  discount?: ProductCreateDiscount;
  characteristics?: ProductCreateCharacteristics;
  image_url?: ProductCreateImageUrl;
  category_id: string;
}
