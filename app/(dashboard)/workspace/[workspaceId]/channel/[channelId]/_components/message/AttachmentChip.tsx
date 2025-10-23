import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface AttachmentChipProps {
  url: string;
  onRemove: () => void;
}

export function AttachmentChip({ url, onRemove }: AttachmentChipProps) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl size-16
        bg-muted/50
        ring-1 ring-border/40 hover:ring-border
        transition-all duration-200 cursor-pointer
        hover:shadow-sm
      "
    >
      <Image
        src={url}
        alt="Attachment"
        fill
        className="
          object-cover transition-opacity duration-200
          group-hover:opacity-60
        "
      />

      {/* Clean overlay */}
      <div
        className="
          absolute inset-0 grid place-items-center
          bg-background/80 backdrop-blur-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
        "
      >
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="
            size-8 rounded-full
            transition-transform duration-150
            hover:scale-110 active:scale-95
          "
          onClick={onRemove}
        >
          <X className="size-4" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
