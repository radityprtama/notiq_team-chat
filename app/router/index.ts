import { createChannel, getChannel, listChannels } from "./channel";
import { createMessage, listMessage } from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
  },

  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
  },
  message: {
    create: createMessage,
    list: listMessage,
  },
};
