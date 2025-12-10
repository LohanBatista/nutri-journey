import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { ProfessionalWithoutPassword } from "@/domain/entities/ProfessionalWithoutPassword";
import type { Organization } from "@/domain/entities/Organization";

declare module "next-auth" {
  interface Session extends DefaultSession {
    professional: ProfessionalWithoutPassword;
    organization: Organization;
  }

  interface User {
    professional: ProfessionalWithoutPassword;
    organization: Organization;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    professional: ProfessionalWithoutPassword;
    organization: Organization;
  }
}

