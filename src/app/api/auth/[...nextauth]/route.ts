import NextAuth from "next-auth";
import { authConfig } from "@/presentation/auth/config";

// Create the NextAuth handler
const { handlers } = NextAuth(authConfig);

export const { GET, POST } = handlers;
