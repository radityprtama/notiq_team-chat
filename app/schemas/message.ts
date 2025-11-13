import z from "zod";

export const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});

export type createMessageSchema = z.infer<typeof createMessageSchema>;
export type updateMessageSchema = z.infer<typeof updateMessageSchema>;
