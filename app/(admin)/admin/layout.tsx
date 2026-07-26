import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./components/sidebar";
import { AdminTopbar } from "./components/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !["admin", "staff"].includes(session.user.role)) {
    redirect("/admin-login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
