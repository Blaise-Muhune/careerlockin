import { requireUserAndProfile } from "@/lib/server/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUserAndProfile();
  return <>{children}</>;
}
