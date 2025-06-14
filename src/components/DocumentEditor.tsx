
import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[300px] font-mono text-sm"
      placeholder="Digite o conteúdo do documento..."
    />
  );
}
