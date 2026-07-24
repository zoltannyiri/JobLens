const { z } = require("zod");

const seniorityValues = [
  "INTERN",
  "JUNIOR",
  "MEDIOR",
  "SENIOR",
  "LEAD",
];

const searchProfileFields = {
  positionTitle: z
    .string()
    .trim()
    .min(2, "A pozíció neve legalább 2 karakter legyen.")
    .max(100, "A pozíció neve legfeljebb 100 karakter lehet."),

  
  seniority: z
    .enum(seniorityValues)
    .nullable()
    .optional(),

  
  experienceMin: z
    .number()
    .int()
    .min(0)
    .max(50)
    .nullable()
    .optional(),


  experienceMax: z
    .number()
    .int()
    .min(0)
    .max(50)
    .nullable()
    .optional(),


  locations: z
    .array(z.string().trim().min(1).max(100))
    .max(20)
    .default([]),


  remoteOnly: z
    .boolean()
    .default(false),


  technologies: z
    .array(z.string().trim().min(1).max(50))
    .max(50)
    .default([]),


  includedKeywords: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .default([]),


  excludedKeywords: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .default([]),


  notificationsEnabled: z
    .boolean()
    .default(true),
};

const createSearchProfileSchema = z
  .object(searchProfileFields)
  .refine(
    (data) =>
      data.experienceMin === null ||
      data.experienceMax === null ||
      data.experienceMin <= data.experienceMax,
    {
      message: "A minimum tapasztalat nem lehet nagyobb a maximumnál.",
      path: ["experienceMax"],
    }
  );

const updateSearchProfileSchema = z.object({
  positionTitle: searchProfileFields.positionTitle.optional(),

  seniority: searchProfileFields.seniority,

  experienceMin: searchProfileFields.experienceMin,

  experienceMax: searchProfileFields.experienceMax,

  locations: searchProfileFields.locations.optional(),

  remoteOnly: searchProfileFields.remoteOnly.optional(),

  technologies: searchProfileFields.technologies.optional(),

  includedKeywords: searchProfileFields.includedKeywords.optional(),

  excludedKeywords: searchProfileFields.excludedKeywords.optional(),

  notificationsEnabled: searchProfileFields.notificationsEnabled.optional(),
});

module.exports = {
  createSearchProfileSchema,
  updateSearchProfileSchema,
};