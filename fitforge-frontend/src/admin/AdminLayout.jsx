import React, {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        mobileOpen={
          mobileSidebarOpen
        }
        onClose={() =>
          setMobileSidebarOpen(
            false
          )
        }
      />

      <div className="lg:ml-64">
        <AdminNavbar
          onMenuClick={() =>
            setMobileSidebarOpen(
              true
            )
          }
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;