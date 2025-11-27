"use client";

import { createMessageSchema } from "@/app/schemas/message";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageComposer } from "./MessageComposer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";

interface iMessageInput {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessagePage = { items: Message[]; nextCursor?: string };
type InfiniteMessagesProps = InfiniteData<MessagePage>;

export function MessageInputForm({ channelId, user }: iMessageInput) {
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);
  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId: channelId,
      content: "",
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });

        const previousData = queryClient.getQueryData<InfiniteMessagesProps>([
          "message.list",
          channelId,
        ]);

        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessages: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: channelId,
          threadId: null,
        };

        queryClient.setQueryData<InfiniteMessagesProps>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData) {
              return {
                pages: [
                  {
                    items: [optimisticMessages],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              } satisfies InfiniteMessagesProps;
            }

            const firstPage = oldData.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };

            const updatedFirstPage: MessagePage = {
              ...firstPage,
              items: [optimisticMessages, ...firstPage.items],
            };

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          }
        );

        return {
          previousData,
          tempId,
        };
      },
      onSuccess: (data, _variables, context) => {
        queryClient.setQueryData<InfiniteMessagesProps>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData) return oldData;

            const updatedPages = oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === context.tempId
                  ? {
                      ...m,
                    }
                  : m
              ),
            }));

            return {
              ...oldData,
              pages: updatedPages,
            };
          }
        );
        form.reset({ channelId, content: "" });
        upload.clear();
        setEditorKey((k) => k + 1);
        return toast.success("message created successfully");
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["message.list", channelId],
            context.previousData
          );
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
                  upload={upload}
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
