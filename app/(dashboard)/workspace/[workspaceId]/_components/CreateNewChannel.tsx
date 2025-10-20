"use client";
import {
  channelSchema,
  ChannelSchemaType,
  transformChannel,
} from "@/app/schemas/channel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orpc } from "@/lib/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateNewChannel() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: "",
    },
  });

  const createChannelMutation = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: (newChannel) => {
        toast.success(`Channel ${newChannel.name} created successfully!`);
        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey(),
        });
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(error.message);
          return;
        }
        toast.error("Failed to create channel, please try again.");
      },
    })
  );

  function onSubmit(values: ChannelSchemaType) {
    createChannelMutation.mutate(values);
  }

  const watchedName = form.watch("name");
  const transformedName = watchedName ? transformChannel(watchedName) : "";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full">
          <Plus className="size-4" />
          Add Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create new channel for your workspace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Channel" {...field} />
                  </FormControl>
                  {transformedName && transformedName !== watchedName && (
                    <p className="text-sm text-muted-foreground">
                      Will be created as:{" "}
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">
                        {transformedName}
                      </code>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={createChannelMutation.isPending}
              type="submit"
              className="w-full"
            >
              {createChannelMutation.isPending
                ? "Creating..."
                : "Create new Channel"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
