import Image from "next/image";
import { Message } from "@/lib/generated/prisma";
import { SafeContent } from "@/components/rich-text-editor/SafeContent";
interface ThreadReplyProps {
  message: Message;
}

export function ThreadReply({ message }: ThreadReplyProps) {
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
      </div>
    </div>
  );
}
