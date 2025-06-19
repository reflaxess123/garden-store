// Автоматически сгенерированный API клиент
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type * as Types from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  return response.json();
}

// Signup
export async function signupApiAuthSignupPost(
  data: SignUpSchema
): Promise<CustomUser> {
  let url = `/api/auth/signup`;
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
  let url = `/api/auth/signin`;
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
  let url = `/api/auth/logout`;
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
  let url = `/api/auth/reset-password`;
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
  let url = `/api/auth/update-password`;
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
  let url = `/api/auth/me`;
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
  let url = `/api/admin/categories`;
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
  let url = `/api/admin/categories`;
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
  let url = `/api/admin/categories/${category_id}`;
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
    mutationFn: updateAdminCategoryApiAdminCategoriesCategoryIdPatch,
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
  let url = `/api/admin/categories/${category_id}`;
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
  let url = `/api/admin/categories/${category_id}`;
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
  let url = `/api/admin/products`;
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
  let url = `/api/admin/products`;
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
  let url = `/api/admin/products/${product_id}`;
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
  let url = `/api/admin/products/${product_id}`;
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
  let url = `/api/admin/products/${product_id}`;
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
    mutationFn: updateAdminProductApiAdminProductsProductIdPatch,
    onSuccess: () => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
}

// Get Admin Orders
export async function getAdminOrdersApiAdminOrdersGet(
): Promise<OrderInDB[]> {
  let url = `/api/admin/orders`;
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
  let url = `/api/admin/orders/${order_id}`;
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
    mutationFn: updateAdminOrderStatusApiAdminOrdersOrderIdPatch,
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
  let url = `/api/admin/orders/${order_id}`;
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

// Get Cart
export async function getCartApiCartGet(
): Promise<CartItemInDB[]> {
  let url = `/api/cart`;
  const options: RequestInit = {
    method: 'GET',
  };
  return fetchApi<CartItemInDB[]>(url, options);
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
  let url = `/api/cart`;
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
  let url = `/api/cart/add`;
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
  let url = `/api/cart/${item_id}`;
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
    mutationFn: updateCartItemApiCartItemIdPatch,
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
  let url = `/api/cart/${item_id}`;
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
  let url = `/api/cart/merge`;
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
  let url = `/api/categories`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.slug !== undefined) {
      searchParams.append('slug', String(params.slug));
    }
    url += `?${searchParams.toString()}`;
  }
  const options: RequestInit = {
    method: 'GET',
  };
  return fetchApi<CategoryInDB[]>(url, options);
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
  let url = `/api/products/bestsellers`;
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) {
      searchParams.append('limit', String(params.limit));
    }
    url += `?${searchParams.toString()}`;
  }
  const options: RequestInit = {
    method: 'GET',
  };
  return fetchApi<ProductInDB[]>(url, options);
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
  let url = `/api/products/slug/${product_slug}`;
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
  category_slug: string
): Promise<ProductInDB[]> {
  let url = `/api/products/category/${category_slug}`;
  const options: RequestInit = {
    method: 'GET',
  };
  return fetchApi<ProductInDB[]>(url, options);
}

// React Query хук для getProductsByCategorySlugApiProductsCategoryCategorySlugGet
export function useGetproductsbycategoryslugapiproductscategorycategoryslugget(
  category_slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['getProductsByCategorySlugApiProductsCategoryCategorySlugGet', category_slug],
    queryFn: () => getProductsByCategorySlugApiProductsCategoryCategorySlugGet(category_slug),
    ...options,
  });
}

// Get Product By Id
export async function getProductByIdApiProductsProductIdGet(
  product_id: string
): Promise<ProductInDB> {
  let url = `/api/products/${product_id}`;
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
  let url = `/api/orders`;
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
  let url = `/api/orders`;
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
  let url = `/api/orders`;
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
  let url = `/api/orders/${order_id}`;
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
  let url = `/api/favorites`;
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
  let url = `/api/favorites/${product_id}`;
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
  let url = `/api/favorites/${product_id}`;
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

// Health Check
export async function healthCheckHealthGet(
): Promise<void> {
  let url = `/health`;
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
