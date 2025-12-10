import { auth } from "@/presentation/auth/config";

export default auth((req) => {
  // Middleware logic can be added here if needed
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
