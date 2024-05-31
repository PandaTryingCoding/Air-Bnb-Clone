"use client";

import React from "react";

import { SignOutButton } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

function SignoutLink() {
  const router = useRouter();
  const { toast } = useToast();
  const handleLogout = () => {
    toast({ description: "You've Successfully Been Signed Out!" });
    router.push("/");
  };
  return (
    <SignOutButton>
      <button className='w-full text-left' onClick={handleLogout}>
        Logout
      </button>
    </SignOutButton>
  );
}

export default SignoutLink;
