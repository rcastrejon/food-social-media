"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export function RecipeDisplay({ htmlContent }: { htmlContent: string }) {
  const editor = useEditor({
    editable: false,
    content: htmlContent,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "prose prose-zinc whitespace-pre-wrap",
      },
    },
  })

  return <EditorContent editor={editor} />
}
