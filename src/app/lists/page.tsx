'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { List, Plus, MoreVertical, Share2, Download, Trash2, Pencil, FileJson, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLists, setLists, getCustomCompanies } from '@/lib/storage';
import companiesData from '@/data/companies.json';
import type { Company } from '@/types/company';

const DEFAULT_LISTS = [
  { id: '1', name: 'Series A Fintech', companyIds: [] as string[] },
  { id: '2', name: 'Developer Tools', companyIds: [] as string[] },
  { id: '3', name: 'AI Infrastructure', companyIds: [] as string[] },
  { id: '4', name: 'Portfolio Monitoring', companyIds: [] as string[] },
];

function ensureDefaultLists() {
  const current = getLists();
  if (current.length === 0) {
    setLists(DEFAULT_LISTS);
    return DEFAULT_LISTS;
  }
  return current;
}

function getCompany(id: string): Company | undefined {
  return companiesData.find((c) => c.id === id) ?? getCustomCompanies().find((c) => c.id === id);
}

function getCompanyName(id: string): string {
  const c = getCompany(id);
  return c?.name ?? id;
}

function formatUpdated(companyIds: string[]): string {
  if (companyIds.length === 0) return '—';
  return `${companyIds.length} companies`;
}

export default function ListsPage() {
  const [lists, setListsState] = useState<{ id: string; name: string; companyIds: string[] }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setListsState(ensureDefaultLists());
  }, []);

  const handleCreate = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: String(Date.now()),
      name: newListName.trim(),
      companyIds: [] as string[],
    };
    const next = [...getLists(), newList];
    setLists(next);
    setListsState(next);
    setNewListName('');
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    const next = getLists().filter((l) => l.id !== id);
    setLists(next);
    setListsState(next);
    setOpenMenuId(null);
  };

  const handleRename = (id: string) => {
    const list = lists.find((l) => l.id === id);
    if (list) {
      setEditName(list.name);
      setEditingId(id);
      setOpenMenuId(null);
    }
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      const next = getLists().map((l) =>
        l.id === editingId ? { ...l, name: editName.trim() } : l
      );
      setLists(next);
      setListsState(next);
      setEditingId(null);
      setEditName('');
    }
  };

  const handleShare = (list: { id: string; name: string }) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/lists?list=${list.id}` : '';
    const text = `List: ${list.name}\n${url}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Link copied to clipboard.'));
    } else {
      prompt('Copy this link:', url);
    }
  };

  const handleExportCsv = (list: { id: string; name: string; companyIds: string[] }) => {
    const headers = ['ID', 'Name'];
    const rows = list.companyIds.map((cid) => [cid, getCompanyName(cid)]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, '-')}-companies.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = (list: { id: string; name: string; companyIds: string[] }) => {
    const companies = list.companyIds.map((cid) => getCompany(cid)).filter(Boolean);
    const payload = { listName: list.name, listId: list.id, companies, exportedAt: new Date().toISOString() };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, '-')}-companies.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Lists</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New List
        </Button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">New list</h3>
            <Input
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newListName.trim()}>Create</Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); setNewListName(''); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div key={list.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <List className="h-6 w-6" />
              </div>
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8" onClick={() => setOpenMenuId(openMenuId === list.id ? null : list.id)}>
                  <MoreVertical className="h-5 w-5" />
                </Button>
                {openMenuId === list.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-md border bg-white py-1 shadow-lg">
                    <Link href={`/lists/${list.id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100" onClick={() => setOpenMenuId(null)}>
                      <ExternalLink className="h-3.5 w-3.5" /> View list
                    </Link>
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100" onClick={() => handleRename(list.id)}>
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </button>
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => handleDelete(list.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            {editingId === list.id ? (
              <div className="flex items-center gap-2">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={saveRename}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditName(''); }}>Cancel</Button>
              </div>
            ) : (
              <Link href={`/lists/${list.id}`} className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors block">
                {list.name}
              </Link>
            )}
            <p className="text-sm text-gray-500 mt-1">{formatUpdated(list.companyIds)}</p>
            <Link href={`/lists/${list.id}`} className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> View list
            </Link>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex -space-x-2">
                {list.companyIds.slice(0, 3).map((cid, i) => (
                  <div key={cid} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500" title={getCompanyName(cid)}>
                    {getCompanyName(cid)[0]?.toUpperCase() ?? i + 1}
                  </div>
                ))}
                {list.companyIds.length === 0 && <span className="text-xs text-gray-400">No companies yet</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8" onClick={() => handleShare(list)} title="Copy link">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8" onClick={() => handleExportCsv(list)} title="Export CSV">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8" onClick={() => handleExportJson(list)} title="Export JSON">
                  <FileJson className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
