"use client";

import { createMessageSchema } from "@/app/schemas/message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MessageComposer } from "../message/MessageComposer";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { useEffect, useState } from "react";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Message } from "@/lib/generated/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { ListMessageInput } from "@/lib/types";

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadReplyForm({ threadId, user }: ThreadReplyFormProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const upload = useAttachmentUpload();
  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: threadId,
    },
  });

  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listoptions = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });

        type MessagePage = {
          items: Array<ListMessageInput>;
          nextCursor?: string;
        };

        type InfiniteMessages = InfiniteData<MessagePage>;

        await queryClient.cancelQueries({ queryKey: listoptions.queryKey });

        const previous = queryClient.getQueryData(listoptions.queryKey);

        const optimistic: Message = {
          id: `optimistic-${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: upload.stageUrl ?? null,
        };

        queryClient.setQueryData(listoptions.queryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: [...oldData.messages, optimistic],
          };
        });

        // optimistic bump realiesCount in main message list for the parent message
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData) return oldData;

            const pages = oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === threadId
                  ? { ...m, repliesCount: m.repliesCount + 1 }
                  : m
              ),
            }));

            return {
              ...oldData,
              pages,
            };
          }
        );

        return {
          listoptions,
          previous,
        };
      },
      onSuccess: (_data, _vars, ctx) => {
        queryClient.invalidateQueries({
          queryKey: ctx.listoptions.queryKey,
        });
        form.reset({ channelId, content: "", threadId });
        upload.clear();
        setEditorKey((prev) => prev + 1);
        return toast.success("Message sent successfully");
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;
        const { listoptions, previous } = ctx;

        if (previous) {
          queryClient.setQueryData(listoptions.queryKey, previous);
        }
        return toast.error("Something went wrong");
      },
    })
  );

  function onSubmit(data: createMessageSchema) {
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stageUrl ?? undefined,
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  value={field.value}
                  onChange={field.onChange}
                  upload={upload}
                  key={editorKey}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
