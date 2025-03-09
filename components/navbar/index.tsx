import React from "react";
import NavSearch from "./NavSearch";
import LinksDropdown from "./LinksDropdown";
import DarkMode from "./DarkMode";
import Logo from "./Logo";

function Navbar() {
  return (
    <nav className='fixed top-0 left-0 w-full bg-white border-b z-50 shadow-md'>
      <div className='container flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 py-6'>
        <div className='flex items-center justify-between'>
          <Logo />
          <div className='sm:hidden gap-4 items-center flex'>
            <DarkMode />
            <LinksDropdown />
          </div>
        </div>
        <NavSearch />
        <div className='sm:flex gap-4 items-center hidden'>
          <DarkMode />
          <LinksDropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
