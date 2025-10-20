import React from "react";
import { WorkspaceHeader } from "./_components/WorkspaceHeader";
import { CreateNewChannel } from "./_components/CreateNewChannel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ChannelList } from "./_components/ChannelList";
import { WorkspaceMemberList } from "./_components/WorkspaceMemberList";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";

const ChannelListLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.channel.list.queryOptions());
  return (
    <>
      <div className="flex h-full w-80 flex-col bg-secondary border-r border-border">
        <div className="flex items-center px-4 h-14 border-b border-border">
          <HydrateClient client={queryClient}>
            <WorkspaceHeader />
          </HydrateClient>
        </div>
        <div className="px-4 py-2">
          <CreateNewChannel />
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground">
              Main
              <ChevronDown className="size-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ChannelList />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="px-4 py-2 border-t border-border">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180">
              Members
              <ChevronUp className="size-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <WorkspaceMemberList />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </>
  );
};

export default ChannelListLayout;
