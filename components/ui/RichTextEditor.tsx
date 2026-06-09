"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Evita que el botón le robe el foco/selección al editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "font-display text-[10px] border-pixel px-2 py-1 min-w-[26px]",
        active ? "bg-card-yellow text-ink" : "bg-scoreboard-slate text-line-white",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <b>B</b>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <i>I</i>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        •
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        1.
      </ToolbarButton>
    </div>
  );
}

/**
 * Editor WYSIWYG (TipTap) para comentarios. Reporta el HTML por `onChange`
 * (vacío como ""). El HTML se sanitiza en el server antes de guardar.
 */
export function RichTextEditor({ onChange }: { onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false, // requerido para SSR de Next (evita mismatch)
    content: "",
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[64px] bg-line-white text-ink border-pixel px-2 py-2 font-body text-sm outline-none " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-0 [&_strong]:font-bold [&_em]:italic",
      },
    },
  });

  return (
    <div className="flex flex-col gap-1.5">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
