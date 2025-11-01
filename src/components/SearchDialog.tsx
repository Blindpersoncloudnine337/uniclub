import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Loader2, X } from 'lucide-react';
import api from '../lib/axios';

interface SearchResult {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  date?: string;
  location?: string;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/search?q=${encodeURIComponent(query)}&limit=20`);
      
      if (response.data.success) {
        setSearchResults(response.data.results);
      } else {
        setError('Failed to fetch search results');
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to perform search');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl animate-scale-in max-h-[50vh] overflow-hidden flex flex-col rounded-3xl top-[10%] translate-y-0">
        <DialogHeader className="px-3 pt-3">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">Search</DialogTitle>
        </DialogHeader>

        <div className="relative px-3 mb-2">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, events, resources..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-7 pr-9 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Searching...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-red-300 dark:text-red-600 mx-auto mb-2" />
              <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && searchQuery && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail} 
                        alt={result.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                          {result.title}
                        </h4>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full flex-shrink-0">
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {result.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {result.category}
                        {result.location && ` • ${result.location}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No results found for "{searchQuery}"</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Try different keywords</p>
            </div>
          )}

          {!searchQuery && !isLoading && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Search for news, events, resources, and posts</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
