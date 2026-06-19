// Shell layout used by every authed page: navbar on top, sidebar on the left,
// page content on the right.

import { useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
