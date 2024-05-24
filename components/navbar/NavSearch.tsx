import React from "react";
import { Input } from "../ui/input";

function NavSearch() {
  return (
    <Input
      type='text'
      placeholder='Find your dream property....'
      className='max-w-xs dark:bg-muted'
    />
  );
}

export default NavSearch;
