import React from "react";
import { ShoppingCart } from "lucide-react";
import { User } from "lucide-react";

function Navbar() {
  return (
    <div className="h-[8vh] w-[100vw] bg-black flex justify-between items-center  ">
      <div className="w-[20vw]  h-full flex justify-center gap-1 items-center bodrer-r-solid border-yellow-300 border-r-[1px]">
        <ShoppingCart size={35} className=" text-yellow-300" />
        <h1 className="text-[20px] text-white">Ethio-Carts</h1>
      </div>
      <div className="w-[15vw] gap-2 cursor-pointer h-full flex justify-center   items-center ">
        <button className="w-[100px] rounded-sm h-[38px] border-yellow-200 flex  justify-center items-center text-yellow-200 border-1">
          <User size={20} className=" text-yellow-300" />
          Profile
        </button>
      </div>
    </div>
  );
}

export default Navbar;
