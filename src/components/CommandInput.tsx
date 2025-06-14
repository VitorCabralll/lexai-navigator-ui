
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PREDEFINED_PROMPTS } from "@/types/prompts";

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onPromptSelect: (promptId: string, message: string) => void;
  placeholder?: string;
}

export function CommandInput({ value, onChange, onPromptSelect, placeholder }: CommandInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPrompts, setFilteredPrompts] = useState(PREDEFINED_PROMPTS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lastCommand = value.split(' ')[0];
    
    if (lastCommand.startsWith('/') && lastCommand.length > 1) {
      const filtered = PREDEFINED_PROMPTS.filter(prompt =>
        prompt.command.toLowerCase().includes(lastCommand.toLowerCase())
      );
      setFilteredPrompts(filtered);
      setShowSuggestions(filtered.length > 0);
    } else if (value === '/') {
      setFilteredPrompts(PREDEFINED_PROMPTS);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const handlePromptSelect = (prompt: any) => {
    const currentValue = value;
    const commandEndIndex = currentValue.indexOf(' ');
    const message = commandEndIndex > -1 ? currentValue.substring(commandEndIndex + 1) : '';
    
    onChange(prompt.command + (message ? ' ' + message : ''));
    setShowSuggestions(false);
    onPromptSelect(prompt.id, message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Digite / para ver prompts disponíveis ou escreva suas instruções..."}
        rows={4}
      />
      
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-3 rounded cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePromptSelect(prompt)}
                >
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {prompt.command}
                    </code>
                    <span className="font-medium">{prompt.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {prompt.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
