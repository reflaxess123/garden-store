import {
  createOrderApiOrdersPost,
  getProductsByCategorySlugApiProductsCategoryCategorySlugGet,
  OrderCreate,
  ProductInDB,
} from "@/shared/api/generated";

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
  searchQuery?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
}

export async function getProductsClient(
  categorySlug: string,
  options?: GetProductsOptions
): Promise<ProductInDB[]> {
  try {
    // Используем сгенерированный API клиент
    const products =
      await getProductsByCategorySlugApiProductsCategoryCategorySlugGet(
        categorySlug
      );

    // Сортировка и фильтрация на клиенте (можно улучшить, добавив параметры в API)
    let filteredProducts = [...products];

    if (options?.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    // Сортировка
    if (options?.sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue: any = a[options.sortBy!];
        let bValue: any = b[options.sortBy!];

        if (options.sortBy === "price") {
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
        }

        if (options.sortOrder === "desc") {
          return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    // Пагинация
    const start = options?.offset || 0;
    const limit = options?.limit || 20;

    return filteredProducts.slice(start, start + limit);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function createOrder(
  fullName: string,
  email: string,
  address: string,
  city: string,
  postalCode: string,
  phone: string,
  items: OrderItem[],
  totalAmount: number
) {
  try {
    const orderData: OrderCreate = {
      full_name: fullName,
      email,
      address,
      city,
      postal_code: postalCode,
      phone,
      total_amount: Math.round(totalAmount * 100) / 100, // Округляем до 2 знаков после запятой
      order_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_snapshot: Math.round(item.priceSnapshot * 100) / 100, // Округляем цену товара тоже
        name: item.name,
        image_url: item.imageUrl || null,
      })),
    };

    const result = await createOrderApiOrdersPost(orderData);
    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
