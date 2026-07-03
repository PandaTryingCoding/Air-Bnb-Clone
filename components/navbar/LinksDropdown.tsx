import { currentUser } from "@clerk/nextjs/server";
import { fetchProfileImage } from "@/utils/actions";
import LinksDropdownMenu from "./LinksDropdownMenu";

async function LinksDropdown() {
  const user = await currentUser();
  const isUserAdmin = user?.id === process.env.ADMIN_USER_ID;
  const profileImageResult = await fetchProfileImage();
  const profileImage =
    typeof profileImageResult === "string" ? profileImageResult : null;

  return (
    <LinksDropdownMenu
      isUserAdmin={!!isUserAdmin}
      profileImage={profileImage}
    />
  );
}

export default LinksDropdown;
