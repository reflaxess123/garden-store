import type { NextFetchEvent } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next({
    request,
  });

  // Проверяем наличие cookie авторизации
  const accessToken = request.cookies.get("access_token")?.value;
  const isAuthenticated = !!accessToken;

  const protectedRoutes = ["/profile", "/favourites", "/cart", "/checkout"];
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Редирект старых ссылок категорий на объединенный каталог
  const categoryRouteMatch = request.nextUrl.pathname.match(
    /^\/catalog\/([^\/]+)$/
  );
  if (categoryRouteMatch) {
    // Перенаправляем все старые ссылки категорий на общий каталог
    const url = request.nextUrl.clone();
    url.pathname = "/catalog";
    // Сохраняем существующие query параметры
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // Если пользователь не авторизован и пытается получить доступ к защищенному маршруту
  if (
    !isAuthenticated &&
    protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    ) &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callback", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Для админ маршрутов проверяем только авторизацию
  // Проверку роли админа оставляем для AuthGuard на клиенте
  if (isAdminRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callback", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
