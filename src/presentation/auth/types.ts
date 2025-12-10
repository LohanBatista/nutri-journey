import type { DefaultSession } from "next-auth";
import type { Professional } from "@/domain/entities/Professional";
import type { Organization } from "@/domain/entities/Organization";

declare module "next-auth" {
  interface Session extends DefaultSession {
    professional: Professional;
    organization: Organization;
  }

  interface User {
    professional: Professional;
    organization: Organization;
  }
}

