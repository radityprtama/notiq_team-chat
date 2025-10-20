import { MessageItem } from "./message/MessageItem";

const messages = [
  {
    id: 1,
    message: "Hi reva",
    date: new Date(),
    avatar: "https://github.com/shadcn.png",
    userName: "Radibyp",
  },
];

export function MessageList() {
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {messages.map((message) => (
          <MessageItem key={message.id} {...message} />
        ))}
      </div>
    </div>
  );
}
