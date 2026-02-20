'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  Calendar, 
  Tag, 
  Plus, 
  Zap, 
  Loader2, 
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import companiesData from '@/data/companies.json';
import { getCustomCompanies } from '@/lib/storage';
import { Company, EnrichmentData } from '@/types/company';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getLists, addCompanyToList } from '@/lib/storage';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [showAddToList, setShowAddToList] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [lists, setListsState] = useState<{ id: string; name: string; companyIds: string[] }[]>([]);

  useEffect(() => {
    const found = companiesData.find(c => c.id === id) ?? getCustomCompanies().find(c => c.id === id);
    if (found) {
      setCompany(found);
    } else {
      router.push('/companies');
    }
  }, [id, router]);

  useEffect(() => {
    setListsState(getLists());

    const stored = localStorage.getItem(`enrichment_${id}`);
    if (stored) {
      setEnrichment(JSON.parse(stored));
    }

    const storedNotes = localStorage.getItem(`notes_${id}`);
    if (storedNotes) {
      setNotes(storedNotes);
    }
  }, [id]);

  const handleEnrich = async () => {
    if (!company) return;
    setIsEnriching(true);
    
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: company.website, name: company.name }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setEnrichment(data);
      localStorage.setItem(`enrichment_${id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Enrichment failed:', error);
      alert('Enrichment failed. Please check your API keys.');
    } finally {
      setIsEnriching(false);
    }
  };

  const saveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem(`notes_${id}`, val);
  };

  if (!company) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Link href="/companies" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Companies
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary font-medium">
              <Globe className="mr-1.5 h-4 w-4" />
              {company.website.replace('https://', '')}
              <ExternalLink className="ml-1 h-3 w-3 opacity-50" />
            </a>
            <span className="flex items-center">
              <MapPin className="mr-1.5 h-4 w-4" />
              {company.location}
            </span>
            <span className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              Founded {company.founded}
            </span>
            <Badge variant="secondary" className="font-semibold px-2.5 py-0.5">
              {company.stage}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleEnrich}
            disabled={isEnriching}
            className="shadow-sm"
          >
            {isEnriching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {enrichment ? 'Re-Enrich' : 'Enrich Profile'}
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => setShowAddToList(!showAddToList)}>
              <Plus className="mr-2 h-4 w-4" />
              Add to List
            </Button>
            {showAddToList && (
              <div className="absolute top-full left-0 mt-1 z-20 min-w-[180px] rounded-md border bg-background py-1 shadow-lg">
                {lists.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No lists yet.</p>
                ) : (
                  lists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        addCompanyToList(list.id, id);
                        setShowAddToList(false);
                        setListsState(getLists());
                      }}
                    >
                      {list.name} {list.companyIds.includes(id) && '✓'}
                    </button>
                  ))
                )}
                <Link href="/lists" className="block px-3 py-2 text-sm text-primary hover:bg-muted" onClick={() => setShowAddToList(false)}>
                  Manage lists →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{company.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {company.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-muted/50">
                    <Tag className="mr-1.5 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {isEnriching && !enrichment && (
            <Card className="border-primary/20 animate-pulse">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                  AI Intelligence
                </CardTitle>
                <CardDescription>Scraping website and analyzing with Gemini...</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
              </CardContent>
            </Card>
          )}

          {enrichment && (
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                    AI Intelligence
                  </CardTitle>
                  <CardDescription>Verified by Firecrawl + Gemini 1.5</CardDescription>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center bg-muted px-2 py-1 rounded">
                  <Clock className="mr-1 h-3 w-3" />
                  {new Date(enrichment.sources[0].timestamp).toLocaleDateString()}
                </span>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Summary</h3>
                  <p className="text-foreground font-medium leading-relaxed">{enrichment.summary}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">What they do</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-foreground">
                    {enrichment.whatTheyDo.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {enrichment.keywords.map(kw => (
                        <Badge key={kw} variant="secondary" className="text-[10px] font-bold">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Derived Signals</h3>
                    <div className="space-y-2">
                      {enrichment.derivedSignals.map((signal, i) => (
                        <div key={i} className="flex items-center text-xs font-medium text-foreground bg-primary/5 px-2 py-1.5 rounded-md border border-primary/10">
                          <Zap className="mr-2 h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          {signal}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Sources</h3>
                  <div className="flex flex-col gap-1">
                    {enrichment.sources.map((src, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground flex justify-between">
                        <span className="truncate max-w-xs">{src.url}</span>
                        <span>{new Date(src.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Signals Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { date: 'Oct 2025', title: 'Product Launch', desc: 'Released new Enterprise features for high-scale teams.' },
                  { date: 'May 2025', title: 'Hiring Surge', desc: 'Added 15 new roles in Engineering and Sales departments.' },
                  { date: 'Jan 2025', title: 'Series B Extension', desc: 'Raised additional $10M from existing investors.' }
                ].map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                      {i !== 2 && <div className="w-px h-full bg-border mt-1"></div>}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{event.date}</span>
                      <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                Team Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                className="min-h-[200px] resize-none focus-visible:ring-1"
                placeholder="Add internal notes about this company..."
                value={notes}
                onChange={(e) => saveNotes(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground italic">Notes are saved automatically to local storage.</p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Thesis Match</CardTitle>
              <CardDescription className="text-primary-foreground/70">Based on fund thesis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black mb-4">8.4<span className="text-primary-foreground/50 text-base font-normal ml-1">/10</span></div>
              <p className="text-sm text-primary-foreground/80 leading-relaxed mb-6 font-medium">
                Strong alignment with our focus on product-led growth and developer tools. High capital efficiency and strong founder-market fit.
              </p>
              <Button
                variant="secondary"
                className="w-full font-bold shadow-sm"
                size="sm"
                onClick={() => setShowScoreDetail(!showScoreDetail)}
              >
                {showScoreDetail ? 'Hide' : 'View'} Detailed Score
              </Button>
              {showScoreDetail && (
                <div className="mt-4 pt-4 border-t border-primary-foreground/20 space-y-3 text-sm">
                  <p className="font-bold">Breakdown</p>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Product–market fit</span><span className="font-bold">9.0</span></div>
                    <div className="flex justify-between"><span>Capital efficiency</span><span className="font-bold">8.5</span></div>
                    <div className="flex justify-between"><span>Founder–market fit</span><span className="font-bold">8.2</span></div>
                    <div className="flex justify-between"><span>Growth potential</span><span className="font-bold">8.0</span></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
