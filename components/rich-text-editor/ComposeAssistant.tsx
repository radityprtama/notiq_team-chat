"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, SparklesIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/server";
import { client } from "@/lib/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

interface ComposeAssistantProps {
  content: string;
  onAccept?: (markdown: string) => void;
}

export function ComposeAssistant({ content, onAccept }: ComposeAssistantProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `compose-assistant`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.compose.generate(
            { content: contentRef.current },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  const lastAssistant = messages.findLast((m) => m.role === "assistant");
  const composeText =
    lastAssistant?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";

  // Function to convert text with dashes to proper bullet points
  const formatSummaryText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Check if the line starts with a dash followed by a space
      if (line.trim().startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.trim().substring(2)}
          </li>
        );
      }
      // Return regular paragraph for non-bullet lines
      return line.trim() ? (
        <p key={index} className="mb-2">
          {line}
        </p>
      ) : null;
    });
  };

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");

      if (status !== "ready" || hasAssistantMessage) {
        return;
      }

      sendMessage({ text: "Rewrite" });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="group relative flex items-center gap-2 rounded-md border border-primary/20 bg-background/50
                 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm
                 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5
                 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]"
        >
          <SparklesIcon className="size-4 text-primary transition-transform duration-300 group-hover:scale-110" />
          <span>Compose</span>
          <span
            className="pointer-events-none absolute inset-0 rounded-md opacity-0
                   group-hover:opacity-30 transition duration-500
                   bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-lg"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[380px] rounded-lg border border-primary/20 bg-background/90
               backdrop-blur-md shadow-xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-background/60 backdrop-blur">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Sparkles className="size-4" />
            <span>AI Compose Assistant</span>
          </div>

          {status === "streaming" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => stop()}
              className="text-xs border-primary/30 hover:border-primary/50"
            >
              Stop
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-3 max-h-80 overflow-y-auto text-sm">
          {error ? (
            <div className="space-y-3">
              <p className="text-sm text-red-500">{error.message}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  clearError();
                  sendMessage({ text: "Help me compose a message" });
                }}
              >
                Try Again
              </Button>
            </div>
          ) : composeText ? (
            <div className="leading-relaxed text-muted-foreground">
              {composeText}
            </div>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2 rounded-md bg-primary/10" />
              <Skeleton className="h-4 w-full rounded-md bg-primary/10" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-primary/10" />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Ready to help you compose a message...
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-3 py-2 bg-muted/30">
          <Button
            type="submit"
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
          >
            Decline
          </Button>
          <Button
            type="submit"
            size={"sm"}
            disabled={!composeText}
            onClick={() => {
              if (!composeText) return;

              onAccept?.(composeText);
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
          >
            Accept
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
