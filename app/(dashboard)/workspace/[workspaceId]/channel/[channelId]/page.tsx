import React from "react";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageList } from "./_components/MessageList";
import { MessageInputForm } from "./_components/message/MessageInput";

const ChannelPageMain = () => {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        <ChannelHeader />

        <div className="flex-1 overflow-hidden mb-4">
          <MessageList />
        </div>

        <div className="border-t bg-background p-4">
          <MessageInputForm />
        </div>
      </div>
    </div>
  );
};

export default ChannelPageMain;
