import { createChannel, getChannel, listChannels } from "./channel";
import { InviteMember, ListMembers } from "./member";
import { createMessage, listMessage, updateMessage } from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    member: {
      list: ListMembers,
      invite: InviteMember,
    },
  },

  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
  },
  message: {
    create: createMessage,
    list: listMessage,
    update: updateMessage,
  },
};
