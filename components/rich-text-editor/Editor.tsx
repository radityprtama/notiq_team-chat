"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtension } from "./extensions";
import { MenuBar } from "./Menubar";
import { ReactNode } from "react";

interface iRichTextEditor {
  field: any;
  sendButton: ReactNode;
  footerLeft?: ReactNode;
}

export function RichTextEditor({
  field,
  sendButton,
  footerLeft,
}: iRichTextEditor) {
  const editor = useEditor({
    immediatelyRender: false,
    content: (() => {
      if (!field?.value) return "";

      try {
        return JSON.parse(field.value);
      } catch {
        return "";
      }
    })(),
    onUpdate: ({ editor }) => {
      if (field.onChange) {
        field.onChange(JSON.stringify(editor.getJSON()));
      }
    },
    extensions: editorExtension,
    editorProps: {
      attributes: {
        class:
          "max-wnone min-h-[125px] focus:outline-none p-4 prose dark:prose-invert marker:text-primary",
      },
    },
  });

  return (
    <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="max-h-[200px] overflow-y-auto"
      />
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-input bg-card">
        <div className="min-h-8 flex items-center">{footerLeft}</div>
        <div className="shrink-0">{sendButton}</div>
      </div>
    </div>
  );
}
