'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomCompanies, setCustomCompanies } from '@/lib/storage';
import type { Company } from '@/types/company';

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('https://');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [location, setLocation] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [founded, setFounded] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const custom = getCustomCompanies();
    const id = String(Date.now());
    const company: Company = {
      id,
      name: name.trim(),
      website: website.trim() || 'https://example.com',
      description: description.trim(),
      industry: industry.trim() || 'Software',
      stage: stage.trim() || 'Seed',
      location: location.trim() || 'Unknown',
      tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
      founded: founded ? parseInt(founded, 10) : new Date().getFullYear(),
    };
    setCustomCompanies([...custom, company]);
    setSaving(false);
    router.push(`/companies/${id}`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/companies" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Companies
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Add Company</h1>
      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" required />
            </div>
            <div>
              <label className="text-sm font-medium">Website</label>
              <Input className="mt-1" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input className="mt-1" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Software" />
              </div>
              <div>
                <label className="text-sm font-medium">Stage</label>
                <Input className="mt-1" value={stage} onChange={(e) => setStage(e.target.value)} placeholder="e.g. Seed, Series A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input className="mt-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
              <div>
                <label className="text-sm font-medium">Founded</label>
                <Input className="mt-1" type="number" value={founded} onChange={(e) => setFounded(e.target.value)} placeholder="Year" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input className="mt-1" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="SaaS, DevTools, B2B" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Company'}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/companies">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
