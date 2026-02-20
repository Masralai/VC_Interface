'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, List, Bookmark, Zap, ArrowRight, BarChart3, Target } from 'lucide-react';
import companiesData from '@/data/companies.json';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function downloadCompaniesCsv() {
  const headers = ['Name', 'Website', 'Industry', 'Stage', 'Location', 'Description', 'Tags', 'Founded'];
  const rows = companiesData.map((c) => [
    c.name,
    c.website,
    c.industry,
    c.stage,
    c.location,
    `"${(c.description || '').replace(/"/g, '""')}"`,
    (c.tags || []).join('; '),
    c.founded,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'companies-export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const router = useRouter();
  const stats = [
    { name: 'Total Companies', value: companiesData.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Lists', value: '12', icon: List, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Saved Searches', value: '8', icon: Bookmark, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Enriched Today', value: '24', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Your sourcing intelligence overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadCompaniesCsv}>Export Data</Button>
          <Button asChild>
            <Link href="/companies">
              <Plus className="mr-2 h-4 w-4" />
              New Search
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.name}</p>
                  <p className="text-3xl font-black text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl shadow-inner`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Companies</CardTitle>
              <CardDescription>Latest additions to your pipeline</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/companies">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {companiesData.slice(0, 5).map((company) => (
                <div key={company.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-black group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {company.name[0]}
                    </div>
                    <div>
                      <Link href={`/companies/${company.id}`} className="text-sm font-bold text-foreground hover:underline">
                        {company.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{company.industry}</span>
                        <span className="text-[10px] text-muted-foreground opacity-50">•</span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{company.stage}</Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded">2h ago</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Sourcing Health
              </CardTitle>
              <CardDescription>Performance against fund thesis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Thesis Alignment', val: 82, color: 'bg-primary' },
                { label: 'Founder Signal', val: 65, color: 'bg-blue-500' },
                { label: 'Enrichment Coverage', val: 94, color: 'bg-amber-500' }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-foreground">{item.label}</span>
                    <span className="text-xs font-black text-primary">{item.val}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-foreground text-background">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="mr-2 h-5 w-5 text-primary" />
                Intelligence Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-background/70 leading-relaxed">
                Companies in the <span className="text-primary font-bold">Infrastructure</span> sector have seen a 20% increase in deal volume this month. Consider refining your search filters.
              </p>
              <Button
                variant="outline"
                className="w-full mt-4 h-8 text-xs font-bold bg-transparent border-primary/50 text-primary hover:bg-primary hover:text-foreground"
                onClick={() => router.push('/companies?industry=Infrastructure')}
              >
                Apply Recommended Filter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
