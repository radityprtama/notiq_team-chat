import Image from "next/image";
import { Message } from "@/lib/generated/prisma";
import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { ReactionBar } from "../reaction/ReactionBar";
import { ListMessageInput } from "@/lib/types";
interface ThreadReplyProps {
  message: ListMessageInput;
  selectedThreadId: string;
}

export function ThreadReply({ message, selectedThreadId }: ThreadReplyProps) {
  return (
    <div className="flex space-x-3 hover:bg-muted/30 rounded-lg">
      <Image
        src={message.authorAvatar}
        alt="Author Image"
        width={32}
        height={32}
        className="rounded-full size-8 shrink-0"
      />

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              month: "short",
              day: "numeric",
            }).format(message.createdAt)}
          </span>
        </div>
        <SafeContent
          content={JSON.parse(message.content)}
          className="text-sm break-words prose dark:prose-invert max-w-none marker:text-primary"
        />

        {message.imageUrl && (
          <div className="mt-2">
            <Image
              src={message.imageUrl}
              alt="Message Attachment"
              width={512}
              height={512}
              className="rounded-md max-h-[320px] w-auto object-contain"
            />
          </div>
        )}

        <ReactionBar
          context={{ type: "thread", threadId: selectedThreadId }}
          reaction={message.reactions}
          messageId={message.id}
        />
      </div>
    </div>
  );
}
