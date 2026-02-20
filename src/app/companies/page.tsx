'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown, ExternalLink, Building2, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import companiesData from '@/data/companies.json';
import { Company } from '@/types/company';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSavedCompanyIds, toggleSavedCompany, getCustomCompanies } from '@/lib/storage';

function CompaniesPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: 'asc' | 'desc' } | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [customCompanies, setCustomCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;
  const allCompanies = useMemo(() => [...companiesData, ...customCompanies], [customCompanies]);

  useEffect(() => {
    const industry = searchParams.get('industry');
    const q = searchParams.get('q');
    if (q != null) setSearchTerm(q);
    else if (industry) setSearchTerm(industry);
  }, [searchParams]);

  useEffect(() => {
    setSavedIds(getSavedCompanyIds());
    setCustomCompanies(getCustomCompanies());
  }, []);

  const stages = ['All', ...Array.from(new Set(allCompanies.map(c => c.stage)))];

  const filteredCompanies = useMemo(() => {
    const result = allCompanies.filter(company => 
      (company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       company.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (stageFilter === 'All' || company.stage === stageFilter)
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [allCompanies, searchTerm, stageFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCompanies.slice(start, start + PAGE_SIZE);
  }, [filteredCompanies, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter]);

  const handleToggleSave = (companyId: string) => {
    toggleSavedCompany(companyId);
    setSavedIds(getSavedCompanyIds());
  };

  const requestSort = (key: keyof Company) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <Button asChild>
          <Link href="/companies/new">
            <Building2 className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, tags, descriptions..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Company
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => requestSort('stage')}
                >
                  <div className="flex items-center">
                    Stage
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link href={`/companies/${company.id}`} className="text-primary hover:underline font-bold">
                        {company.name}
                      </Link>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-muted-foreground flex items-center hover:text-primary mt-1"
                      >
                        {company.website.replace('https://', '')}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{company.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {company.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{company.tags.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSave(company.id)}
                        className={savedIds.includes(company.id) ? 'text-primary' : ''}
                      >
                        {savedIds.includes(company.id) ? (
                          <>
                            <Bookmark className="mr-1 h-3.5 w-3.5 fill-current" />
                            Saved
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/companies/${company.id}`}>Details</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No companies found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {filteredCompanies.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredCompanies.length)} of {filteredCompanies.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-8 w-48 bg-muted animate-pulse rounded" /><div className="h-96 bg-muted animate-pulse rounded" /></div>}>
      <CompaniesPageContent />
    </Suspense>
  );
}
