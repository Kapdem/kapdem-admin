import { NextResponse, type NextRequest } from "next/server";

// Public olarak erişilebilen (auth gerektirmeyen) yollar
const PUBLIC_PATHS = ["/login"];

// Bazı statik dosyalar veya next iç dosyaları için erken çıkış
function isAsset(pathname: string) {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname === "/favicon.ico"
  ) {
    return true;
  }

  // Dosya uzantısı içeriyorsa (örn: .png .jpg .svg .css .js)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Asset veya public dosyaları kontrol etme
  if (isAsset(pathname)) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const authCookie = req.cookies.get("Authentication");
  const isAuthenticated = Boolean(authCookie?.value); // Cookie varsa authenticated varsay

  // Debug amacıyla response header ekleyelim (Network tab'da görebilirsiniz)
  const debugHeaders = new Headers();
  debugHeaders.set("x-auth-cookie-present", (!!authCookie).toString());
  debugHeaders.set("x-authenticated", isAuthenticated.toString());
  debugHeaders.set("x-path", pathname);

  // Eğer kullanıcı authenticated değilse ve public olmayan bir sayfaya gidiyorsa login'e yönlendir
  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname === "/" ? "" : pathname);
    const res = NextResponse.redirect(loginUrl);
    debugHeaders.forEach((v, k) => res.headers.set(k, v));
    return res;
  }

  // Kullanıcı zaten login olmuşsa /login sayfasına girmesin, anasayfaya yönlendir
  if (isAuthenticated && pathname === "/login") {
    const res = NextResponse.redirect(new URL("/", req.url));
    debugHeaders.forEach((v, k) => res.headers.set(k, v));
    return res;
  }

  const res = NextResponse.next();
  debugHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}

// Matcher: middleware'in çalışacağı yolları tanımlar
// Aşağıdaki regex _next, static asset'ler ve /api altında özel bir şey tanımlamaz ama
// temel statik dosyaları zaten isAsset fonksiyonu ile by-pass ediyoruz.
export const config = {
  matcher: ["/(.*)"],
};
