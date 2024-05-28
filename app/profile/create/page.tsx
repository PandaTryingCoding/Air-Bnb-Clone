import SubmitButton from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";

const createProfileAction = async (prevState: any, formData: FormData) => {
  "use server";
  const firstName = formData.get("firstName") as string;
  console.log(firstName);
  return { message: "Profile Created!" };
};

function ProfilePage() {
  return (
    <section>
      <h1 className='text-2xl f0nt-semibold mb-8 capitalize'>New User</h1>
      <div className='border p-8 rounded-md '>
        <FormContainer action={createProfileAction}>
          <div className='grid md:grid-cols-2 mt-4 gap-4'>
            <FormInput type='text' name='firstName' label='First Name' />
            <FormInput type='text' name='lastName' label='Last Name' />
            <FormInput type='text' name='userName' label='User Name' />
          </div>
          <SubmitButton text='Create Profile' className='mt-8' />
        </FormContainer>
      </div>
    </section>
  );
}

export default ProfilePage;
