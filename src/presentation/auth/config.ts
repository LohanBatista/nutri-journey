import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

// Garantir que o secret esteja definido
const secret = process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV !== "test") {
  console.warn(
    "⚠️  NEXTAUTH_SECRET não está definido. Por favor, defina NEXTAUTH_SECRET no arquivo .env"
  );
}

export const authConfig: NextAuthConfig = {
  secret: secret || (process.env.NODE_ENV === "development" ? "development-secret-key-minimum-32-characters-long" : undefined),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/app");
      
      if (isOnApp) {
        if (isLoggedIn) return true;
        return false;
      }
      
      return true;
    },
  },
  providers: [],
};

export const { auth, signIn, signOut } = NextAuth(authConfig);

