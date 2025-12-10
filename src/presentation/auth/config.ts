import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { makeAuthenticateProfessionalUseCase } from "@/application/factories/makeAuthenticateProfessionalUseCase";
import type { ProfessionalWithoutPassword } from "@/domain/entities/ProfessionalWithoutPassword";

// Garantir que o secret esteja definido
const secret = process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV !== "test") {
  console.warn(
    "⚠️  NEXTAUTH_SECRET não está definido. Por favor, defina NEXTAUTH_SECRET no arquivo .env"
  );
}

const resolvedSecret =
  secret ||
  (process.env.NODE_ENV === "development"
    ? "development-secret-key-minimum-32-characters-long"
    : undefined);

export const authConfig: NextAuthConfig = {
  ...(resolvedSecret !== undefined && { secret: resolvedSecret }),
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
    async jwt({ token, user }) {
      if (user) {
        token.professional = user.professional;
        token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.professional && token.organization) {
        session.professional = token.professional;
        session.organization = token.organization;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const authenticateUseCase = makeAuthenticateProfessionalUseCase();
          const result = await authenticateUseCase.execute({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          // Remover passwordHash antes de retornar
          const { passwordHash, ...professionalWithoutPassword } = result.professional;
          const professionalSafe: ProfessionalWithoutPassword = professionalWithoutPassword;

          return {
            id: result.professional.id,
            email: result.professional.email,
            name: result.professional.name,
            professional: professionalSafe,
            organization: result.organization,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
};

export const { auth, signIn, signOut } = NextAuth(authConfig);

