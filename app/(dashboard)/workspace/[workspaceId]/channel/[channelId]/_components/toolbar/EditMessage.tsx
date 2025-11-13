import { updateMessageSchema } from "@/app/schemas/message";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Message } from "@/lib/generated/prisma";
import z from "zod";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

interface EditMessageProps {
  message: Message;
  onCancel: () => void;
  onSave: () => void;
}

export function EditMessage({ message, onCancel, onSave }: EditMessageProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      messageId: message.id,
      content: message.content,
    },
  });

  const updateMutation = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (updated) => {
        type MessagePage = { items: Message[]; nextCursor?: string };
        type infiniteMessages = InfiniteData<MessagePage>;
        queryClient.setQueryData<infiniteMessages>(
          ["message.list", message.channelId],
          (oldData) => {
            if (!oldData) return oldData;
            const updatedMessage = updated.message;

            const pages = oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === updatedMessage.id
                  ? { ...item, ...updatedMessage }
                  : item
              ),
            }));
            return {
              ...oldData,
              pages,
            };
          }
        );
        toast.success("Message updated successfully");
        onSave();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  function onSubmit(data: z.infer<typeof updateMessageSchema>) {
    updateMutation.mutate(data);
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
                <RichTextEditor
                  field={field}
                  sendButton={
                    <div className="flex gap-3 items-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onCancel}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={updateMutation.isPending}
                        type="submit"
                        size="sm"
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  }
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
