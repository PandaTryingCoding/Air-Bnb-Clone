import React from "react";
import { LuUser2 } from "react-icons/lu";
import { fetchProfileImage } from "@/utils/actions";
import Image from "next/image";
import { headers } from "next/headers";

async function UserIcon() {
  const profileImage = await fetchProfileImage();
  if (!profileImage)
    return <LuUser2 className='w-6 h-6 bg-primary rounded-full text-white' />;
  if (profileImage) {
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
}

export default UserIcon;
