const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, { message: "A név legalább 4 karakter hosszú kell legyen." })
    .max(40, { message: "A név legfeljebb 40 karakter hosszú lehet." }),


  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Érvénytelen e-mail cím." })
    .max(100, { message: "Az e-mail cím legfeljebb 100 karakter hosszú lehet." }),


  password: z
    .string()
    .min(8, { message: "A jelszó legalább 8 karakter hosszú kell legyen." })
    .regex(/[A-Z]/, { message: "A jelszónak tartalmaznia kell legalább egy nagybetűt." })
    .regex(/[a-z]/, { message: "A jelszónak tartalmaznia kell legalább egy kisbetűt." })
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Érvénytelen e-mail cím." })
    .min(1, { message: "Az e-mail cím megadása kötelező." })
    .max(100, { message: "Az e-mail cím legfeljebb 100 karakter hosszú lehet." }),


  password: z
    .string()
    .min(1, { message: "A jelszó megadása kötelező." })
});

module.exports = {
  registerSchema,
  loginSchema,
};