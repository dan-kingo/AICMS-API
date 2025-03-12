import { z } from "zod";

const registerSchema = z.object({
  firstName: z
    .string({ required_error: " is required." })
    .min(5, { message: " must be at least 5 characters long." })
    .max(50, { message: " is must less than 50." }),

  lastName: z
    .string({ required_error: " is required." })
    .min(5, { message: " must be at least 5 characters long." })
    .max(50, { message: " is must less than 50." }),

  userName: z
    .string({ required_error: " is required." })
    .min(5, { message: " must be at least 5 characters long." }),

  email: z
    .string({ required_error: " is required." })
    .email({ message: "Invalid email address." }),

  phoneNumber: z
    .string({ required_error: " is required." })
    .min(10, { message: " must be at least 10 digits." })
    .max(10, { message: " is too long." })
    .regex(/^0[79]\d{8}$/, {
      message: " must start with '09' or '07' and be 10 digits long.",
    }),

  password: z
    .string({ required_error: " is required." })
    .min(8, { message: " must be at least 8 characters long." })
    .regex(/[A-Z]/, {
      message: " must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: " must contain at least one lowercase letter.",
    })
    .regex(/\d/, { message: " must contain at least one digit." })
    .regex(/[\W_]/, {
      message: " must contain at least one special character.",
    }),
  role: z.string().optional(),
});

export type registerFormData = z.infer<typeof registerSchema>;
export default registerSchema;
