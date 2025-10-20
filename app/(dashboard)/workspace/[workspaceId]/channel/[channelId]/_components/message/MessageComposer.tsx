import { RichTextEditor } from "@/components/rich-text-editor/Editor";

interface iMessageComposer {
  value: string;
  onChange: (next: string) => void;
}

export function MessageComposer({ value, onChange }: iMessageComposer) {
  return (
    <>
      <RichTextEditor field={{ value, onChange }} />
    </>
  );
}
