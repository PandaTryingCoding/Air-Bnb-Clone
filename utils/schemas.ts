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

export function validateWithZodSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(" , "));
  }
  return result.data;
}
