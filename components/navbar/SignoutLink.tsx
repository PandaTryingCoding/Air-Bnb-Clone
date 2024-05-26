"use client";

import React from "react";

import { SignOutButton } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";

function SignoutLink() {
  const { toast } = useToast();
  const handleLogout = () => {
    toast({ description: "You've Successfully Been Signed Out!" });
  };
  return (
    <SignOutButton redirectUrl='/'>
      <button className='w-full text-left' onClick={handleLogout}>
        Logout
      </button>
    </SignOutButton>
  );
}

export default SignoutLink;
