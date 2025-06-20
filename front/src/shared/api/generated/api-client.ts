// Автоматически сгенерированный API клиент
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CartItemAdd, CartItemInDB, CartItemUpdate, CartItemWithProduct, CartMergeRequest,
  CategoryCreate, CategoryInDB, CategoryUpdate, ChatInDB, ChatMessageInDB,
  ChatMessageSend, CustomUser, FavouriteInDB, HTTPValidationError, LocalCartItem,
  NotificationInDB, NotificationUpdate, OrderCreate, OrderDelete, OrderInDB,
  OrderItemCreate, OrderItemInDB, OrderUpdateStatus, ProductCreate, ProductInDB,
  ProductUpdate, ResetPasswordSchema, SignInSchema, SignUpSchema, Token,
  UpdatePasswordSchema, UserCreate, UserInDB, UserUpdate, ValidationError
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.sadovnick.store';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Если ответ 204 No Content или тело пустое, возвращаем undefined
  if (
    response.status === 204 ||
    !response.headers.get('content-length') ||
    response.headers.get('content-length') === '0'
  ) {
    return undefined as T;
  }

  return response.json();
}

// Signup
export async function signupApiAuthSignupPost(
  data: SignUpSchema
): Promise<CustomUser> {
  const url = `/api/auth/signup`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<CustomUser>(url, options);
}

// React Query мутация для signupApiAuthSignupPost
export function useSignupapiauthsignuppost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: signupApiAuthSignupPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Signin
export async function signinApiAuthSigninPost(
  data: SignInSchema
): Promise<Token> {
  const url = `/api/auth/signin`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<Token>(url, options);
}

// React Query мутация для signinApiAuthSigninPost
export function useSigninapiauthsigninpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: signinApiAuthSigninPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Logout
export async function logoutApiAuthLogoutPost(
): Promise<void> {
  const url = `/api/auth/logout`;
  const options: RequestInit = {
    method: 'POST',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для logoutApiAuthLogoutPost
export function useLogoutapiauthlogoutpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutApiAuthLogoutPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Reset Password
export async function resetPasswordApiAuthResetPasswordPost(
  data: ResetPasswordSchema
): Promise<void> {
  const url = `/api/auth/reset-password`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для resetPasswordApiAuthResetPasswordPost
export function useResetpasswordapiauthresetpasswordpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resetPasswordApiAuthResetPasswordPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Update Password
export async function updatePasswordApiAuthUpdatePasswordPost(
  data: UpdatePasswordSchema
): Promise<void> {
  const url = `/api/auth/update-password`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для updatePasswordApiAuthUpdatePasswordPost
export function useUpdatepasswordapiauthupdatepasswordpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePasswordApiAuthUpdatePasswordPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Current User Info
export async function getCurrentUserInfoApiAuthMeGet(
): Promise<CustomUser> {
  const url = `/api/auth/me`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<CustomUser>(url, options);
}

// React Query хук для getCurrentUserInfoApiAuthMeGet
export function useGetcurrentuserinfoapiauthmeget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getCurrentUserInfoApiAuthMeGet'],
    queryFn: getCurrentUserInfoApiAuthMeGet,
    ...options,
  });
}

// Get Admin Categories
export async function getAdminCategoriesApiAdminCategoriesGet(
): Promise<CategoryInDB[]> {
  const url = `/api/admin/categories`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<CategoryInDB[]>(url, options);
}

// React Query хук для getAdminCategoriesApiAdminCategoriesGet
export function useGetadmincategoriesapiadmincategoriesget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminCategoriesApiAdminCategoriesGet'],
    queryFn: getAdminCategoriesApiAdminCategoriesGet,
    ...options,
  });
}

// Create Admin Category
export async function createAdminCategoryApiAdminCategoriesPost(
  data: CategoryCreate
): Promise<CategoryInDB> {
  const url = `/api/admin/categories`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<CategoryInDB>(url, options);
}

// React Query мутация для createAdminCategoryApiAdminCategoriesPost
export function useCreateadmincategoryapiadmincategoriespost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAdminCategoryApiAdminCategoriesPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Update Admin Category
export async function updateAdminCategoryApiAdminCategoriesCategoryIdPatch(
  category_id: string,
  data: CategoryUpdate
): Promise<CategoryInDB> {
  const url = `/api/admin/categories/${category_id}`;
  const options: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(data),
  };

  return fetchApi<CategoryInDB>(url, options);
}

// React Query мутация для updateAdminCategoryApiAdminCategoriesCategoryIdPatch
export function useUpdateadmincategoryapiadmincategoriescategoryidpatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({category_id, data}: { category_id: string, data: any }) => updateAdminCategoryApiAdminCategoriesCategoryIdPatch(category_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Delete Admin Category
export async function deleteAdminCategoryApiAdminCategoriesCategoryIdDelete(
  category_id: string
): Promise<void> {
  const url = `/api/admin/categories/${category_id}`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для deleteAdminCategoryApiAdminCategoriesCategoryIdDelete
export function useDeleteadmincategoryapiadmincategoriescategoryiddelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAdminCategoryApiAdminCategoriesCategoryIdDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Admin Category
export async function getAdminCategoryApiAdminCategoriesCategoryIdGet(
  category_id: string
): Promise<CategoryInDB> {
  const url = `/api/admin/categories/${category_id}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<CategoryInDB>(url, options);
}

// React Query хук для getAdminCategoryApiAdminCategoriesCategoryIdGet
export function useGetadmincategoryapiadmincategoriescategoryidget(
  category_id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminCategoryApiAdminCategoriesCategoryIdGet', category_id],
    queryFn: () => getAdminCategoryApiAdminCategoriesCategoryIdGet(category_id),
    ...options,
  });
}

// Get Admin Products
export async function getAdminProductsApiAdminProductsGet(
): Promise<ProductInDB[]> {
  const url = `/api/admin/products`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ProductInDB[]>(url, options);
}

// React Query хук для getAdminProductsApiAdminProductsGet
export function useGetadminproductsapiadminproductsget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminProductsApiAdminProductsGet'],
    queryFn: getAdminProductsApiAdminProductsGet,
    ...options,
  });
}

// Create Admin Product
export async function createAdminProductApiAdminProductsPost(
  data: ProductCreate
): Promise<ProductInDB> {
  const url = `/api/admin/products`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<ProductInDB>(url, options);
}

// React Query мутация для createAdminProductApiAdminProductsPost
export function useCreateadminproductapiadminproductspost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAdminProductApiAdminProductsPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Admin Product
export async function getAdminProductApiAdminProductsProductIdGet(
  product_id: string
): Promise<ProductInDB> {
  const url = `/api/admin/products/${product_id}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ProductInDB>(url, options);
}

// React Query хук для getAdminProductApiAdminProductsProductIdGet
export function useGetadminproductapiadminproductsproductidget(
  product_id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminProductApiAdminProductsProductIdGet', product_id],
    queryFn: () => getAdminProductApiAdminProductsProductIdGet(product_id),
    ...options,
  });
}

// Delete Admin Product
export async function deleteAdminProductApiAdminProductsProductIdDelete(
  product_id: string
): Promise<void> {
  const url = `/api/admin/products/${product_id}`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для deleteAdminProductApiAdminProductsProductIdDelete
export function useDeleteadminproductapiadminproductsproductiddelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAdminProductApiAdminProductsProductIdDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Update Admin Product
export async function updateAdminProductApiAdminProductsProductIdPatch(
  product_id: string,
  data: ProductUpdate
): Promise<ProductInDB> {
  const url = `/api/admin/products/${product_id}`;
  const options: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(data),
  };

  return fetchApi<ProductInDB>(url, options);
}

// React Query мутация для updateAdminProductApiAdminProductsProductIdPatch
export function useUpdateadminproductapiadminproductsproductidpatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({product_id, data}: { product_id: string, data: any }) => updateAdminProductApiAdminProductsProductIdPatch(product_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Admin Orders
export async function getAdminOrdersApiAdminOrdersGet(
): Promise<OrderInDB[]> {
  const url = `/api/admin/orders`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<OrderInDB[]>(url, options);
}

// React Query хук для getAdminOrdersApiAdminOrdersGet
export function useGetadminordersapiadminordersget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminOrdersApiAdminOrdersGet'],
    queryFn: getAdminOrdersApiAdminOrdersGet,
    ...options,
  });
}

// Update Admin Order Status
export async function updateAdminOrderStatusApiAdminOrdersOrderIdPatch(
  order_id: string,
  data: OrderUpdateStatus
): Promise<OrderInDB> {
  const url = `/api/admin/orders/${order_id}`;
  const options: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(data),
  };

  return fetchApi<OrderInDB>(url, options);
}

// React Query мутация для updateAdminOrderStatusApiAdminOrdersOrderIdPatch
export function useUpdateadminorderstatusapiadminordersorderidpatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({order_id, data}: { order_id: string, data: any }) => updateAdminOrderStatusApiAdminOrdersOrderIdPatch(order_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Delete Admin Order
export async function deleteAdminOrderApiAdminOrdersOrderIdDelete(
  order_id: string
): Promise<void> {
  const url = `/api/admin/orders/${order_id}`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для deleteAdminOrderApiAdminOrdersOrderIdDelete
export function useDeleteadminorderapiadminordersorderiddelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAdminOrderApiAdminOrdersOrderIdDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Admin Users
export async function getAdminUsersApiAdminUsersGet(
): Promise<UserInDB[]> {
  const url = `/api/admin/users`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<UserInDB[]>(url, options);
}

// React Query хук для getAdminUsersApiAdminUsersGet
export function useGetadminusersapiadminusersget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminUsersApiAdminUsersGet'],
    queryFn: getAdminUsersApiAdminUsersGet,
    ...options,
  });
}

// Create Admin User
export async function createAdminUserApiAdminUsersPost(
  data: UserCreate
): Promise<UserInDB> {
  const url = `/api/admin/users`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<UserInDB>(url, options);
}

// React Query мутация для createAdminUserApiAdminUsersPost
export function useCreateadminuserapiadminuserspost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAdminUserApiAdminUsersPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Admin User
export async function getAdminUserApiAdminUsersUserIdGet(
  user_id: string
): Promise<UserInDB> {
  const url = `/api/admin/users/${user_id}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<UserInDB>(url, options);
}

// React Query хук для getAdminUserApiAdminUsersUserIdGet
export function useGetadminuserapiadminusersuseridget(
  user_id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAdminUserApiAdminUsersUserIdGet', user_id],
    queryFn: () => getAdminUserApiAdminUsersUserIdGet(user_id),
    ...options,
  });
}

// Update Admin User
export async function updateAdminUserApiAdminUsersUserIdPatch(
  user_id: string,
  data: UserUpdate
): Promise<UserInDB> {
  const url = `/api/admin/users/${user_id}`;
  const options: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(data),
  };

  return fetchApi<UserInDB>(url, options);
}

// React Query мутация для updateAdminUserApiAdminUsersUserIdPatch
export function useUpdateadminuserapiadminusersuseridpatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({user_id, data}: { user_id: string, data: any }) => updateAdminUserApiAdminUsersUserIdPatch(user_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Delete Admin User
export async function deleteAdminUserApiAdminUsersUserIdDelete(
  user_id: string
): Promise<void> {
  const url = `/api/admin/users/${user_id}`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для deleteAdminUserApiAdminUsersUserIdDelete
export function useDeleteadminuserapiadminusersuseriddelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAdminUserApiAdminUsersUserIdDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Cart
export async function getCartApiCartGet(
): Promise<CartItemWithProduct[]> {
  const url = `/api/cart`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<CartItemWithProduct[]>(url, options);
}

// React Query хук для getCartApiCartGet
export function useGetcartapicartget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getCartApiCartGet'],
    queryFn: getCartApiCartGet,
    ...options,
  });
}

// Clear Cart
export async function clearCartApiCartDelete(
): Promise<void> {
  const url = `/api/cart`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для clearCartApiCartDelete
export function useClearcartapicartdelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clearCartApiCartDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Add To Cart
export async function addToCartApiCartAddPost(
  data: CartItemAdd
): Promise<CartItemInDB> {
  const url = `/api/cart/add`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<CartItemInDB>(url, options);
}

// React Query мутация для addToCartApiCartAddPost
export function useAddtocartapicartaddpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToCartApiCartAddPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Update Cart Item
export async function updateCartItemApiCartItemIdPatch(
  item_id: string,
  data: CartItemUpdate
): Promise<CartItemInDB> {
  const url = `/api/cart/${item_id}`;
  const options: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(data),
  };

  return fetchApi<CartItemInDB>(url, options);
}

// React Query мутация для updateCartItemApiCartItemIdPatch
export function useUpdatecartitemapicartitemidpatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({item_id, data}: { item_id: string, data: any }) => updateCartItemApiCartItemIdPatch(item_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Remove From Cart
export async function removeFromCartApiCartItemIdDelete(
  item_id: string
): Promise<void> {
  const url = `/api/cart/${item_id}`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для removeFromCartApiCartItemIdDelete
export function useRemovefromcartapicartitemiddelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFromCartApiCartItemIdDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Merge Cart
export async function mergeCartApiCartMergePost(
  data: CartMergeRequest
): Promise<CartItemInDB[]> {
  const url = `/api/cart/merge`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<CartItemInDB[]>(url, options);
}

// React Query мутация для mergeCartApiCartMergePost
export function useMergecartapicartmergepost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mergeCartApiCartMergePost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Categories
export async function getCategoriesApiCategoriesGet(
  params?: { slug?: any }
): Promise<CategoryInDB[]> {
  const url = `/api/categories`;
  const options: RequestInit = {
    method: 'GET',
  };

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.slug !== undefined) {
      searchParams.append('slug', String(params.slug));
    }
    finalUrl += `?${searchParams.toString()}`;
  }
  return fetchApi<CategoryInDB[]>(finalUrl, options);
}

// React Query хук для getCategoriesApiCategoriesGet
export function useGetcategoriesapicategoriesget(
  params?: { slug?: any },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getCategoriesApiCategoriesGet', params],
    queryFn: () => getCategoriesApiCategoriesGet(params),
    ...options,
  });
}

// Get Bestsellers
export async function getBestsellersApiProductsBestsellersGet(
  params?: { limit?: number }
): Promise<ProductInDB[]> {
  const url = `/api/products/bestsellers`;
  const options: RequestInit = {
    method: 'GET',
  };

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) {
      searchParams.append('limit', String(params.limit));
    }
    finalUrl += `?${searchParams.toString()}`;
  }
  return fetchApi<ProductInDB[]>(finalUrl, options);
}

// React Query хук для getBestsellersApiProductsBestsellersGet
export function useGetbestsellersapiproductsbestsellersget(
  params?: { limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getBestsellersApiProductsBestsellersGet', params],
    queryFn: () => getBestsellersApiProductsBestsellersGet(params),
    ...options,
  });
}

// Get Product By Slug
export async function getProductBySlugApiProductsSlugProductSlugGet(
  product_slug: string
): Promise<ProductInDB> {
  const url = `/api/products/slug/${product_slug}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ProductInDB>(url, options);
}

// React Query хук для getProductBySlugApiProductsSlugProductSlugGet
export function useGetproductbyslugapiproductsslugproductslugget(
  product_slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getProductBySlugApiProductsSlugProductSlugGet', product_slug],
    queryFn: () => getProductBySlugApiProductsSlugProductSlugGet(product_slug),
    ...options,
  });
}

// Get Products By Category Slug
export async function getProductsByCategorySlugApiProductsCategoryCategorySlugGet(
  category_slug: string,
  params?: { limit?: any, offset?: any, searchQuery?: any, sortBy?: any, sortOrder?: any, minPrice?: any, maxPrice?: any, categoryFilter?: any, inStock?: any, hasDiscount?: any }
): Promise<ProductInDB[]> {
  const url = `/api/products/category/${category_slug}`;
  const options: RequestInit = {
    method: 'GET',
  };

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) {
      searchParams.append('limit', String(params.limit));
    }
    if (params.offset !== undefined) {
      searchParams.append('offset', String(params.offset));
    }
    if (params.searchQuery !== undefined) {
      searchParams.append('searchQuery', String(params.searchQuery));
    }
    if (params.sortBy !== undefined) {
      searchParams.append('sortBy', String(params.sortBy));
    }
    if (params.sortOrder !== undefined) {
      searchParams.append('sortOrder', String(params.sortOrder));
    }
    if (params.minPrice !== undefined) {
      searchParams.append('minPrice', String(params.minPrice));
    }
    if (params.maxPrice !== undefined) {
      searchParams.append('maxPrice', String(params.maxPrice));
    }
    if (params.categoryFilter !== undefined) {
      searchParams.append('categoryFilter', String(params.categoryFilter));
    }
    if (params.inStock !== undefined) {
      searchParams.append('inStock', String(params.inStock));
    }
    if (params.hasDiscount !== undefined) {
      searchParams.append('hasDiscount', String(params.hasDiscount));
    }
    finalUrl += `?${searchParams.toString()}`;
  }
  return fetchApi<ProductInDB[]>(finalUrl, options);
}

// React Query хук для getProductsByCategorySlugApiProductsCategoryCategorySlugGet
export function useGetproductsbycategoryslugapiproductscategorycategoryslugget(
  category_slug: string,
  params?: { limit?: any, offset?: any, searchQuery?: any, sortBy?: any, sortOrder?: any, minPrice?: any, maxPrice?: any, categoryFilter?: any, inStock?: any, hasDiscount?: any },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getProductsByCategorySlugApiProductsCategoryCategorySlugGet', category_slug, params],
    queryFn: () => getProductsByCategorySlugApiProductsCategoryCategorySlugGet(category_slug, params),
    ...options,
  });
}

// Get Product By Id
export async function getProductByIdApiProductsProductIdGet(
  product_id: string
): Promise<ProductInDB> {
  const url = `/api/products/${product_id}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ProductInDB>(url, options);
}

// React Query хук для getProductByIdApiProductsProductIdGet
export function useGetproductbyidapiproductsproductidget(
  product_id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getProductByIdApiProductsProductIdGet', product_id],
    queryFn: () => getProductByIdApiProductsProductIdGet(product_id),
    ...options,
  });
}

// Get User Orders
export async function getUserOrdersApiOrdersGet(
): Promise<OrderInDB[]> {
  const url = `/api/orders`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<OrderInDB[]>(url, options);
}

// React Query хук для getUserOrdersApiOrdersGet
export function useGetuserordersapiordersget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getUserOrdersApiOrdersGet'],
    queryFn: getUserOrdersApiOrdersGet,
    ...options,
  });
}

// Create Order
export async function createOrderApiOrdersPost(
  data: OrderCreate
): Promise<OrderInDB> {
  const url = `/api/orders`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<OrderInDB>(url, options);
}

// React Query мутация для createOrderApiOrdersPost
export function useCreateorderapiorderspost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrderApiOrdersPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Delete Order
export async function deleteOrderApiOrdersDelete(
  data: OrderDelete
): Promise<void> {
  const url = `/api/orders`;
  const options: RequestInit = {
    method: 'DELETE',
    body: JSON.stringify(data),
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для deleteOrderApiOrdersDelete
export function useDeleteorderapiordersdelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOrderApiOrdersDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get User Order
export async function getUserOrderApiOrdersOrderIdGet(
  order_id: string
): Promise<OrderInDB> {
  const url = `/api/orders/${order_id}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<OrderInDB>(url, options);
}

// React Query хук для getUserOrderApiOrdersOrderIdGet
export function useGetuserorderapiordersorderidget(
  order_id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getUserOrderApiOrdersOrderIdGet', order_id],
    queryFn: () => getUserOrderApiOrdersOrderIdGet(order_id),
    ...options,
  });
}

// Get Favorites
export async function getFavoritesApiFavoritesGet(
): Promise<FavouriteInDB[]> {
  const url = `/api/favorites`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<FavouriteInDB[]>(url, options);
}

// React Query хук для getFavoritesApiFavoritesGet
export function useGetfavoritesapifavoritesget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getFavoritesApiFavoritesGet'],
    queryFn: getFavoritesApiFavoritesGet,
    ...options,
  });
}

// Add To Favorites
export async function addToFavoritesApiFavoritesProductIdPost(
  product_id: string
): Promise<FavouriteInDB> {
  const url = `/api/favorites/${product_id}`;
  const options: RequestInit = {
    method: 'POST',
  };

  return fetchApi<FavouriteInDB>(url, options);
}

// React Query мутация для addToFavoritesApiFavoritesProductIdPost
export function useAddtofavoritesapifavoritesproductidpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToFavoritesApiFavoritesProductIdPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Remove From Favorites
export async function removeFromFavoritesApiFavoritesProductIdDelete(
  product_id: string
): Promise<void> {
  const url = `/api/favorites/${product_id}`;
  const options: RequestInit = {
    method: 'DELETE',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для removeFromFavoritesApiFavoritesProductIdDelete
export function useRemovefromfavoritesapifavoritesproductiddelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFromFavoritesApiFavoritesProductIdDelete,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get User Notifications
export async function getUserNotificationsApiNotificationsGet(
  params?: { unread_only?: boolean, limit?: number }
): Promise<NotificationInDB[]> {
  const url = `/api/notifications`;
  const options: RequestInit = {
    method: 'GET',
  };

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.unread_only !== undefined) {
      searchParams.append('unread_only', String(params.unread_only));
    }
    if (params.limit !== undefined) {
      searchParams.append('limit', String(params.limit));
    }
    finalUrl += `?${searchParams.toString()}`;
  }
  return fetchApi<NotificationInDB[]>(finalUrl, options);
}

// React Query хук для getUserNotificationsApiNotificationsGet
export function useGetusernotificationsapinotificationsget(
  params?: { unread_only?: boolean, limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getUserNotificationsApiNotificationsGet', params],
    queryFn: () => getUserNotificationsApiNotificationsGet(params),
    ...options,
  });
}

// Mark Notification Read
export async function markNotificationReadApiNotificationsNotificationIdPatch(
  notification_id: string,
  data: NotificationUpdate
): Promise<NotificationInDB> {
  const url = `/api/notifications/${notification_id}`;
  const options: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(data),
  };

  return fetchApi<NotificationInDB>(url, options);
}

// React Query мутация для markNotificationReadApiNotificationsNotificationIdPatch
export function useMarknotificationreadapinotificationsnotificationidpatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({notification_id, data}: { notification_id: string, data: any }) => markNotificationReadApiNotificationsNotificationIdPatch(notification_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Mark All Notifications Read
export async function markAllNotificationsReadApiNotificationsMarkAllReadPost(
): Promise<void> {
  const url = `/api/notifications/mark-all-read`;
  const options: RequestInit = {
    method: 'POST',
  };

  return fetchApi<void>(url, options);
}

// React Query мутация для markAllNotificationsReadApiNotificationsMarkAllReadPost
export function useMarkallnotificationsreadapinotificationsmarkallreadpost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllNotificationsReadApiNotificationsMarkAllReadPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Unread Count
export async function getUnreadCountApiNotificationsUnreadCountGet(
): Promise<void> {
  const url = `/api/notifications/unread-count`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<void>(url, options);
}

// React Query хук для getUnreadCountApiNotificationsUnreadCountGet
export function useGetunreadcountapinotificationsunreadcountget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getUnreadCountApiNotificationsUnreadCountGet'],
    queryFn: getUnreadCountApiNotificationsUnreadCountGet,
    ...options,
  });
}

// Get User Chats
export async function getUserChatsApiChatsGet(
): Promise<ChatInDB[]> {
  const url = `/api/chats`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ChatInDB[]>(url, options);
}

// React Query хук для getUserChatsApiChatsGet
export function useGetuserchatsapichatsget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getUserChatsApiChatsGet'],
    queryFn: getUserChatsApiChatsGet,
    ...options,
  });
}

// Create Or Get Chat
export async function createOrGetChatApiChatsPost(
): Promise<ChatInDB> {
  const url = `/api/chats`;
  const options: RequestInit = {
    method: 'POST',
  };

  return fetchApi<ChatInDB>(url, options);
}

// React Query мутация для createOrGetChatApiChatsPost
export function useCreateorgetchatapichatspost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrGetChatApiChatsPost,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Chat Detail
export async function getChatDetailApiChatsChatIdGet(
  chat_id: string
): Promise<ChatInDB> {
  const url = `/api/chats/${chat_id}`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ChatInDB>(url, options);
}

// React Query хук для getChatDetailApiChatsChatIdGet
export function useGetchatdetailapichatschatidget(
  chat_id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getChatDetailApiChatsChatIdGet', chat_id],
    queryFn: () => getChatDetailApiChatsChatIdGet(chat_id),
    ...options,
  });
}

// Send Message
export async function sendMessageApiChatsChatIdMessagesPost(
  chat_id: string,
  data: ChatMessageSend
): Promise<ChatMessageInDB> {
  const url = `/api/chats/${chat_id}/messages`;
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  return fetchApi<ChatMessageInDB>(url, options);
}

// React Query мутация для sendMessageApiChatsChatIdMessagesPost
export function useSendmessageapichatschatidmessagespost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({chat_id, data}: { chat_id: string, data: any }) => sendMessageApiChatsChatIdMessagesPost(chat_id, data),
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get All Chats
export async function getAllChatsApiAdminChatsGet(
): Promise<ChatInDB[]> {
  const url = `/api/admin/chats`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<ChatInDB[]>(url, options);
}

// React Query хук для getAllChatsApiAdminChatsGet
export function useGetallchatsapiadminchatsget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getAllChatsApiAdminChatsGet'],
    queryFn: getAllChatsApiAdminChatsGet,
    ...options,
  });
}

// Health Check
export async function healthCheckHealthGet(
): Promise<void> {
  const url = `/health`;
  const options: RequestInit = {
    method: 'GET',
  };

  return fetchApi<void>(url, options);
}

// React Query хук для healthCheckHealthGet
export function useHealthcheckhealthget(
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['healthCheckHealthGet'],
    queryFn: healthCheckHealthGet,
    ...options,
  });
}
