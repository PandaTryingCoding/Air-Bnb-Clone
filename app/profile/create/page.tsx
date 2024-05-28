import { Button } from "@/components/ui/button";

const createProfileAction = async (formData: FormData) => {
  "use server";
  const firstName = formData.get("firstName") as string;
  console.log(firstName);
};

function ProfilePage() {
  return (
    <section>
      <h1 className='text-2xl f0nt-semibold mb-8 capitalize'>New User</h1>
      <div className='border p-8 rounded-md max-w-lg'>
        <form action={createProfileAction}></form>
      </div>
    </section>
  );
}

export default ProfilePage;
