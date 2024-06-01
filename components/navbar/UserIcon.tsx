import React from "react";
import { LuUser2 } from "react-icons/lu";
import { fetchProfileImage } from "@/utils/actions";
import Image from "next/image";
import { headers } from "next/headers";

async function UserIcon() {
  const profileImage: string | { message: string } | null | undefined =
    await fetchProfileImage();
  if (!profileImage)
    return <LuUser2 className='w-6 h-6 bg-primary rounded-full text-white' />;
  if (typeof profileImage === "string") {
    return (
      <Image
        src={profileImage}
        alt='Profile Icon'
        width={20}
        height={20}
        className='!w-6 !h-6 rounded-full object-cover'
      />
    );
  }

  return <LuUser2 className='w-6 h-6 bg-primary rounded-full text-white' />;
}

export default UserIcon;
