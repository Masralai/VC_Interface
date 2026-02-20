import type { Company } from '@/types/company';

export const STORAGE_KEYS = {
  savedCompanies: 'scout_saved_companies',
  savedSearches: 'scout_saved_searches',
  lists: 'scout_lists',
  customCompanies: 'scout_custom_companies',
} as const;

export function getSavedCompanyIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.savedCompanies);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavedCompany(id: string): boolean {
  const ids = getSavedCompanyIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.savedCompanies, JSON.stringify(ids));
    return false;
  }
  ids.push(id);
  localStorage.setItem(STORAGE_KEYS.savedCompanies, JSON.stringify(ids));
  return true;
}

export function getSavedSearches(): { id: string; name: string; query: string; date: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.savedSearches);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setSavedSearches(searches: { id: string; name: string; query: string; date: string }[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.savedSearches, JSON.stringify(searches));
}

export function getLists(): { id: string; name: string; companyIds: string[] }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.lists);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLists(lists: { id: string; name: string; companyIds: string[] }[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(lists));
}

export function getCustomCompanies(): Company[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customCompanies);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCustomCompanies(companies: Company[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.customCompanies, JSON.stringify(companies));
}

export function addCompanyToList(listId: string, companyId: string) {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  if (list.companyIds.includes(companyId)) return;
  list.companyIds.push(companyId);
  setLists(lists);
}
