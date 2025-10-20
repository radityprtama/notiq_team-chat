import { createMessageSchema } from "@/app/schemas/message";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
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

interface iMessageInput {
  channelId: string;
}

export function MessageInputForm({ channelId }: iMessageInput) {
  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId: channelId,
      content: "",
    },
  });
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
