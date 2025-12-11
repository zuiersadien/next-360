// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Log de inicio
  console.log("Middleware START:", pathname);

  // Permitir archivos estáticos y rutas públicas sin auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    console.log("Middleware END: Public path/Bypass");
    return NextResponse.next();
  }

  // 2. Log de Secreto (Para verificar si el valor existe)
  const secretExists = !!process.env.NEXTAUTH_SECRET;
  console.log(`Middleware CHECK: NEXTAUTH_SECRET exists? ${secretExists}`);

  if (!secretExists) {
    // Si el secreto no existe, logueamos el fallo y podríamos redirigir a un error
    console.error(
      "CRITICAL ERROR: NEXTAUTH_SECRET is MISSING in Edge Runtime!",
    );
    // Opcionalmente, podrías redirigir a una página de error 500 para evitar el bucle de login
    // return NextResponse.rewrite(new URL('/error', request.url));
  }

  // 3. Verificación de token de sesión JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 4. Log del Token
  console.log(
    `Middleware CHECK: Token status -> ${token ? "Authenticated" : "Unauthenticated"}`,
  );

  if (!token) {
    // 5. Redirección
    console.log("Middleware END: Redirecting to /login");
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Continuar
  console.log("Middleware END: Authorized access");
  return NextResponse.next();
}

// Configurar rutas donde se aplica middleware
export const config = {
  matcher: ["/((?!login|_next|api/auth|static).*)"], // bloquea todo excepto login y rutas internas Next
};
