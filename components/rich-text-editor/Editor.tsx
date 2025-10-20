"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtension } from "./extensions";
import { MenuBar } from "./Menubar";

interface iRichTextEditor {
  field: any;
}

export function RichTextEditor({ field }: iRichTextEditor) {
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
    </div>
  );
}
