import { z } from "zod";

export const InviteMemberSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.email(),
});

export type InviteMemberSchemaType = z.infer<typeof InviteMemberSchema>;
