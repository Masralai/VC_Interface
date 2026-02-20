'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Search, Play, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSavedSearches, setSavedSearches } from '@/lib/storage';

const DEFAULT_SEARCHES = [
  { id: '1', name: 'Seed stage SaaS in Europe', query: 'stage:Seed industry:SaaS location:Europe', date: 'Oct 12, 2025' },
  { id: '2', name: 'Developer Tools with >10 employees', query: 'tags:DevTools headcount>10', date: 'Nov 5, 2025' },
  { id: '3', name: 'Stealth founders in SF', query: 'status:Stealth location:"San Francisco"', date: 'Dec 1, 2025' },
];

function ensureDefaultSearches() {
  const current = getSavedSearches();
  if (current.length === 0) {
    setSavedSearches(DEFAULT_SEARCHES);
    return DEFAULT_SEARCHES;
  }
  return current;
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<{ id: string; name: string; query: string; date: string }[]>([]);

  useEffect(() => {
    setSearches(ensureDefaultSearches());
  }, []);

  const handleRunSearch = (query: string) => {
    router.push(`/companies?q=${encodeURIComponent(query)}`);
  };

  const handleDelete = (id: string) => {
    const next = searches.filter((s) => s.id !== id);
    setSavedSearches(next);
    setSearches(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Saved Searches</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {searches.map((search) => (
            <li key={search.id} className="p-6 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mr-4">
                    <Bookmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{search.name}</h3>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Search className="mr-1.5 h-3.5 w-3.5" />
                        {search.query}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        Saved on {search.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" onClick={() => handleRunSearch(search.query)}>
                    <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Run Search
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(search.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {searches.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No saved searches</h3>
            <p className="mt-1 text-sm text-gray-500">Search for companies and save them to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
