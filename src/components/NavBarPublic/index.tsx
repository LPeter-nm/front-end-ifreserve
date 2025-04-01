"use client";

import logo from "../../assets/images/logo.png";

type NavbarProps = {
  rightContent?: React.ReactNode;
};

const Navbar = ({ rightContent }: NavbarProps) => {
  return (
    <div className="bg-[#1E3231] h-20 p-3 fixed w-full z-50">
      <div className="flex content-center gap-60 justify-between">
        <div className="flex justify-start items-center">
          <img src={logo.src} alt="IFReserve-Logo" className="h-[60px]" />
        </div>
        <div className="flex items-center gap-4">
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export default Navbar;