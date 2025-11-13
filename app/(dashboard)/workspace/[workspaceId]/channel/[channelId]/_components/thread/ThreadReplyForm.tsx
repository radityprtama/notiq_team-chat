"use client";

import { createMessageSchema } from "@/app/schemas/message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MessageComposer } from "../message/MessageComposer";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Message } from "@/lib/generated/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";

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
        return {
          listoptions,
          previous,
        };
      },
      onSuccess: () => {
        form.reset({ channelId, content: "", threadId });
        upload.clear();
        setEditorKey((prev) => prev + 1);
        return toast.success("Message sent successfully");
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;
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
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
