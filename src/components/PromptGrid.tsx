
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PREDEFINED_PROMPTS } from "@/types/prompts";
import { FileText, Package, Shield, FileCheck, PenTool, Search } from "lucide-react";
import { PromptSearch } from "./PromptSearch";

interface PromptGridProps {
  selectedPromptId: string;
  onPromptSelect: (promptId: string) => void;
}

const promptIcons = {
  'parecer': FileText,
  'peticao': Package,
  'contrato': PenTool,
  'recurso': FileCheck,
  'denuncia': Shield
};

const promptCategories = {
  'parecer': 'Consultivo',
  'peticao': 'Processual',
  'contrato': 'Contratual',
  'recurso': 'Processual',
  'denuncia': 'Criminal'
};

export function PromptGrid({ selectedPromptId, onPromptSelect }: PromptGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(Object.values(promptCategories)));
  }, []);

  const filteredPrompts = useMemo(() => {
    return PREDEFINED_PROMPTS.filter(prompt => {
      const matchesSearch = searchQuery === "" || 
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase());

      const promptCategory = promptCategories[prompt.id as keyof typeof promptCategories];
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(promptCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="space-y-4">
      <PromptSearch
        onSearchChange={handleSearchChange}
        onCategoryFilter={handleCategoryFilter}
        availableCategories={availableCategories}
      />

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Nenhum documento encontrado</p>
          <p className="text-sm text-muted-foreground">Tente ajustar sua busca ou filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => {
            const Icon = promptIcons[prompt.id as keyof typeof promptIcons] || FileText;
            const isSelected = selectedPromptId === prompt.id;
            const category = promptCategories[prompt.id as keyof typeof promptCategories];
            
            return (
              <Card 
                key={prompt.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5 shadow-md' : 'hover:bg-muted/50'
                }`}
                onClick={() => onPromptSelect(prompt.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {category}
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <Icon className={`h-8 w-8 mx-auto mb-3 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <h3 className="font-medium text-sm mb-1">{prompt.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{prompt.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {searchQuery && (
        <p className="text-xs text-muted-foreground text-center">
          {filteredPrompts.length} resultado(s) encontrado(s)
        </p>
      )}
    </div>
  );
}
