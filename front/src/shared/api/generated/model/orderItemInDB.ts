/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import type { OrderItemInDBImageUrl } from './orderItemInDBImageUrl';

export interface OrderItemInDB {
  productId: string;
  quantity: number;
  priceSnapshot: string;
  name: string;
  imageUrl?: OrderItemInDBImageUrl;
  id: string;
  orderId: string;
}
