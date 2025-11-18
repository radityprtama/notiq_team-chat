import { createChannel, getChannel, listChannels } from "./channel";
import { InviteMember, ListMembers } from "./member";
import {
  createMessage,
  listMessage,
  listThreadReplies,
  togglereaction,
  updateMessage,
} from "./message";
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
    reaction: {
      toggle: togglereaction,
    },
    thread: {
      list: listThreadReplies,
    },
  },
};
