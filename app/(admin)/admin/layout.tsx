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
    <div className="min-h-screen">
      <AdminSidebar />

      {/* Content area — offset by fixed sidebar width on desktop */}
      <div className="flex h-screen flex-col lg:pl-60">
        {/* Fixed top bar */}
        <div className="shrink-0">
          <AdminTopbar user={session.user} />
        </div>
        {/* Scrollable main */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
