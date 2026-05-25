import { z } from "zod";

// ===============================================
// Common shared types
// ===============================================

export const TenantContextSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  primaryDomain: z.string(),
  theme: z.object({
    brandName: z.string(),
    logoUrl: z.string().nullable(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
  }),
  enabledModules: z.array(z.string()),
});
export type TenantContext = z.infer<typeof TenantContextSchema>;

export const BirthDetailsSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(["male", "female", "other"]).optional(),
  date: z.string(),                         // ISO date
  time: z.string(),                          // "HH:mm"
  lat: z.number(),
  lng: z.number(),
  place: z.string(),
  timezone: z.string().default("Asia/Kolkata"),
});
export type BirthDetails = z.infer<typeof BirthDetailsSchema>;

export const RechargeRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
});
export type RechargeRequest = z.infer<typeof RechargeRequestSchema>;
