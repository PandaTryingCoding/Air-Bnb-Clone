import React from "react";
import { BsBuildings } from "react-icons/bs";
import Link from "next/link";
import { Button } from "../ui/button";

function Logo() {
  return (
    <Button size='icon' asChild>
      <Link href='/'>
        <BsBuildings className='w-6 h-6' />
      </Link>
    </Button>
  );
}

export default Logo;
