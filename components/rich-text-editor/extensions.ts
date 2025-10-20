import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { all, createLowlight } from "lowlight";
import CodeBlock from "@tiptap/extension-code-block-lowlight";
import { Placeholder } from "@tiptap/extensions/placeholder";

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);

export const baseExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  CodeBlock.configure({
    lowlight,
  }),
];

export const editorExtension = [
  ...baseExtensions,
  Placeholder.configure({
    placeholder: "Type your message here...",
  }),
];
