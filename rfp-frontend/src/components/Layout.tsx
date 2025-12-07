import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  current: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ current, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-semibold text-lg">AI RFP Manager</h1>
          <Navbar current={current} onNavigate={onNavigate} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
