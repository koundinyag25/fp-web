import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const breadcrumbFor = (pathname: string): string => {
  const seg = pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
  return `admin / ${seg}`;
};

export const AdminShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex min-h-screen flex-1 flex-col lg:ml-sidebar">
        <TopBar breadcrumb={breadcrumbFor(pathname)} onOpenMenu={() => setDrawerOpen(true)} />
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
