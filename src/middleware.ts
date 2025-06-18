import { createSupabaseAdminClient } from "@/shared/api/supabaseClient";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextFetchEvent } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ["/profile", "/favourites", "/cart", "/checkout"];
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  let isAdmin = false;
  if (user) {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: userData, error } = await supabaseAdmin
      .from("User")
      .select("isAdmin")
      .eq("id", user.id)
      .single();

    if (userData) {
      isAdmin = userData.isAdmin;
    }
  }

  // Если пользователь не авторизован и пытается получить доступ к защищенному маршруту
  if (
    !user &&
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

  // Если пользователь пытается получить доступ к админ-панели и не является администратором
  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; // Перенаправить на главную страницу
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the response object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(response.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
  return response;
}

export const config = {
  matcher: [
    /*     *
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
