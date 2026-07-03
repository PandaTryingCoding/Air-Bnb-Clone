"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuAlignLeft, LuUser2 } from "react-icons/lu";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import SignoutLink from "./SignoutLink";
import { links } from "@/utils/links";

type LinksDropdownMenuProps = {
  isUserAdmin: boolean;
  profileImage: string | null;
};

function LinksDropdownMenu({
  isUserAdmin,
  profileImage,
}: LinksDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='flex gap-4 max-w-[100px]'>
          <LuAlignLeft className='w-6 h-6' />
          {profileImage ? (
            <Image
              src={profileImage}
              alt='Profile Icon'
              width={20}
              height={20}
              className='!w-6 !h-6 rounded-full object-cover'
            />
          ) : (
            <LuUser2 className='w-6 h-6 bg-primary rounded-full text-white' />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-52' align='start' sideOffset={10}>
        <SignedOut>
          <DropdownMenuItem onSelect={() => setOpen(false)}>
            <SignInButton mode='modal'>
              <button className='w-full text-left'>Login</button>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(false)}>
            <SignUpButton mode='modal'>
              <button className='w-full text-left'>Register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut>
        <SignedIn>
          {links.map((link) => {
            if (link.label === "admin" && !isUserAdmin) return null;
            return (
              <DropdownMenuItem key={link.href} asChild>
                <Link
                  href={link.href}
                  className='capitalize w-full cursor-pointer'
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(false)}>
            <SignoutLink />
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LinksDropdownMenu;
