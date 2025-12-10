import { redirect } from "next/navigation";
import { auth } from "@/presentation/auth/config";
import { AppLayoutClient } from "@/presentation/components/layout/AppLayoutClient";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <AppLayoutClient>{children}</AppLayoutClient>;
}

