import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {children}
    </div>
  );
}
