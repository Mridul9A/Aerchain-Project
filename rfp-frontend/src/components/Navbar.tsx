import React from "react";

interface NavbarProps {
  current: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ current, onNavigate }) => {
  const linkClass = (page: string) =>
    `px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition
     ${
       current === page
         ? "bg-blue-600 text-white"
         : "text-blue-600 hover:bg-blue-100"
     }`;

  return (
    <nav className="flex gap-3 items-center">
      <button className={linkClass("create")} onClick={() => onNavigate("create")}>
        New RFP
      </button>

      <button className={linkClass("rfps")} onClick={() => onNavigate("rfps")}>
        RFPs
      </button>

      <button className={linkClass("vendors")} onClick={() => onNavigate("vendors")}>
        Vendors
      </button>
    </nav>
  );
};

export default Navbar;
