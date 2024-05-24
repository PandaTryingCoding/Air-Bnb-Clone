import React from "react";
import { LuWarehouse } from "react-icons/lu";
import Link from "next/link";
import { Button } from "../ui/button";

function Logo() {
  return (
    <Button size='icon' asChild>
      <Link href='/'>
        <LuWarehouse className='w-6 h-6' />
      </Link>
    </Button>
  );
}

export default Logo;
