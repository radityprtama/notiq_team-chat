import z from "zod";

export function transformChannel(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const channelSchema = z.object({
  name: z
    .string()
    .min(2, "Channel must be at least 2 characters long")
    .max(50, "Channel must be at most 50 characters long")
    .transform((name, ctx) => {
      const transformed = transformChannel(name);
      if (transformed.length < 2) {
        ctx.addIssue({
          code: "custom",
          message:
            "Channel name must contain at least 2 characters after transformation",
        });
        return z.NEVER;
      }
      return transformed;
    }),
});

export type ChannelSchemaType = z.infer<typeof channelSchema>;
