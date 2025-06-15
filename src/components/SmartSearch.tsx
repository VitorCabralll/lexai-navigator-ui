
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Star, 
  Tag,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Clock
} from "lucide-react";

interface SearchFilters {
  query: string;
  categories: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  rating: number | null;
  sortBy: 'name' | 'date' | 'rating' | 'usage';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

interface SmartSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableCategories: string[];
  placeholder?: string;
  showViewMode?: boolean;
  showAdvancedFilters?: boolean;
}

const INITIAL_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  dateRange: 'all',
  rating: null,
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid'
};

export function SmartSearch({ 
  onFiltersChange, 
  availableCategories = [],
  placeholder = "Buscar...",
  showViewMode = true,
  showAdvancedFilters = true
}: SmartSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lexai-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = (query: string) => {
    if (!query.trim() || recentSearches.includes(query)) return;
    
    const updated = [query, ...recentSearches.slice(0, 4)];
    setRecentSearches(updated);
    localStorage.setItem('lexai-recent-searches', JSON.stringify(updated));
  };

  // Update filters and notify parent
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  // Handle search query
  const handleSearch = (query: string) => {
    updateFilters({ query });
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    onFiltersChange(INITIAL_FILTERS);
    setShowFilters(false);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categories.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.rating !== null) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4"
          />
          
          {/* Recent searches dropdown */}
          {filters.query === '' && recentSearches.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 px-2 py-1">Buscas recentes</p>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {search}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter toggle */}
        {showAdvancedFilters && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${activeFiltersCount > 0 ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="bg-blue-600 text-white text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}

        {/* View mode toggle */}
        {showViewMode && (
          <div className="flex border border-gray-200 rounded-lg">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilters({ viewMode: 'grid' })}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilters({ viewMode: 'list' })}
              className="rounded-l-none border-l"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Advanced filters panel */}
      {showFilters && showAdvancedFilters && (
        <Card className="border-gray-200">
          <CardContent className="p-4 space-y-4">
            {/* Categories */}
            {availableCategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categorias
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <button key={category} onClick={() => toggleCategory(category)}>
                      <Badge
                        variant={filters.categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-50"
                      >
                        {category}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'today', label: 'Hoje' },
                  { value: 'week', label: 'Esta semana' },
                  { value: 'month', label: 'Este mês' }
                ].map((option) => (
                  <button key={option.value} onClick={() => updateFilters({ dateRange: option.value as any })}>
                    <Badge
                      variant={filters.dateRange === option.value ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      {option.label}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avaliação mínima
              </label>
              <div className="flex gap-2">
                {[null, 1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating || 0} onClick={() => updateFilters({ rating })}>
                    <Badge
                      variant={filters.rating === rating ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      {rating ? `${rating}+ ⭐` : 'Todas'}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort options */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Ordenar por
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'name', label: 'Nome' },
                  { value: 'date', label: 'Data' },
                  { value: 'rating', label: 'Avaliação' },
                  { value: 'usage', label: 'Uso' }
                ].map((option) => (
                  <button 
                    key={option.value} 
                    onClick={() => {
                      if (filters.sortBy === option.value) {
                        updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
                      } else {
                        updateFilters({ sortBy: option.value as any, sortOrder: 'asc' });
                      }
                    }}
                  >
                    <Badge
                      variant={filters.sortBy === option.value ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      {option.label}
                      {filters.sortBy === option.value && (
                        <span className="ml-1">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            <div className="flex justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Filtros ativos:</span>
          {filters.query && (
            <Badge variant="outline" className="bg-blue-50">
              "{filters.query}"
              <button onClick={() => handleSearch('')} className="ml-1 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.categories.map((category) => (
            <Badge key={category} variant="outline" className="bg-purple-50">
              {category}
              <button onClick={() => toggleCategory(category)} className="ml-1 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.dateRange !== 'all' && (
            <Badge variant="outline" className="bg-green-50">
              {filters.dateRange}
              <button onClick={() => updateFilters({ dateRange: 'all' })} className="ml-1 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
