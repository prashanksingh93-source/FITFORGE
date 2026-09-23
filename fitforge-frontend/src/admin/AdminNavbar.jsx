import React from "react";

import {
  Menu,
  Bell,
} from "lucide-react";

const AdminNavbar = ({
  onMenuClick,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm font-medium text-gray-500">
          FITFORGE ADMINISTRATION
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell size={20} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;