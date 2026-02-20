'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, List, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLists, removeCompanyFromList, getCustomCompanies } from '@/lib/storage';
import companiesData from '@/data/companies.json';
import type { Company } from '@/types/company';

function getCompany(id: string): Company | undefined {
  return companiesData.find((c) => c.id === id) ?? getCustomCompanies().find((c) => c.id === id);
}

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [list, setList] = useState<{ id: string; name: string; companyIds: string[] } | null>(null);

  useEffect(() => {
    const found = getLists().find((l) => l.id === id);
    if (found) setList(found);
    else router.push('/lists');
  }, [id, router]);

  const refreshList = () => {
    const found = getLists().find((l) => l.id === id);
    if (found) setList(found);
  };

  const handleRemove = (companyId: string) => {
    removeCompanyFromList(id, companyId);
    refreshList();
  };

  if (!list) return null;

  const companies = list.companyIds.map((cid) => getCompany(cid)).filter(Boolean) as Company[];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/lists" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lists
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <List className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <p className="text-sm text-muted-foreground">{list.companyIds.length} companies</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        {companies.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-medium">No companies in this list</p>
            <p className="text-sm mt-1">Add companies from their profile page via &quot;Add to List&quot;</p>
            <Button asChild className="mt-4">
              <Link href="/companies">Browse companies</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {companies.map((company) => (
              <li key={company.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div className="flex flex-col min-w-0">
                  <Link href={`/companies/${company.id}`} className="font-medium text-primary hover:underline truncate">
                    {company.name}
                  </Link>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground flex items-center hover:text-primary mt-0.5"
                  >
                    {company.website.replace('https://', '')}
                    <ExternalLink className="ml-1 h-3 w-3 inline" />
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleRemove(company.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
