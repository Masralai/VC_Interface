export interface Company {
  id: string;
  name: string;
  website: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  tags: string[];
  founded: number;
}

export interface EnrichmentData {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: string[];
  sources: { url: string; timestamp: string }[];
}

export interface CompanyNote {
  id: string;
  companyId: string;
  content: string;
  timestamp: string;
}

export interface CompanyList {
  id: string;
  name: string;
  companyIds: string[];
}
