import { GroupReactionSchema } from "@/app/schemas/message";
import { Message } from "./generated/prisma";

export type ListMessageInput = Message & {
  replyCount: number;
  reactions: GroupReactionSchema[];
};
