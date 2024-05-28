import * as z from "zod";
import { ZodSchema } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .max(20, { message: "Max length of characters in the First Name is 20" }),
  lastName: z
    .string()
    .max(20, { message: "Max length of characters in the Last Name is 20" }),
  userName: z
    .string()
    .max(15, { message: "Max length of characters in the Username is 15" }),
});
