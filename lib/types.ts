import { Message } from "./generated/prisma";

export type ListMessageInput = Message & {
  repliesCount: number;
};
