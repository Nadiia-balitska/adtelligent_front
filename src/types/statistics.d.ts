export type ReportMode = "date" | "hour";

export interface RawEvent {
  event: "load-page" | "load-ad-module" | "auctionInit" | "auctionEnd" | "bidRequested" | "bidResponse" | "bidWon" | string;
  timestamp: string | number | Date;
  page?: string;
  userAgent?: string;
  auctionId?: string;
  adUnitCode?: string;
  bidder?: string;       
  cpm?: number;
  creativeId?: string;
  size?: string;
  currency?: string;
  geo?: string;
  userId?: string;
}

export type DimensionKey =
  | "date"        
  | "hour"       
  | "event"
  | "bidder"
  | "creativeId"
  | "adUnitCode"
  | "geo";

export interface StatRow {
  // вибрані виміри (слайси)
  date: string;          // YYYY-MM-DD 
  hour?: string;         
  event?: string;
  bidder?: string;
  creativeId?: string;
  adUnitCode?: string;
  geo?: string;

  // метрики
  unique_users?: number;
  auctions?: number;
  bids?: number;
  wins?: number;
  win_rate?: number;     // %
  avg_cpm?: number;      
}

export type FieldKey =
  | "hour"
  | "unique_users"
  | "auctions"
  | "bids"
  | "wins"
  | "win_rate"
  | "avg_cpm";

export interface FieldDef {
  key: FieldKey;
  label: string;
}

export interface Filters {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  report: ReportMode;

  event?: string;
  bidder?: string;
  creativeId?: string;
  adUnitCode?: string;
  geo?: string;

  cpmMin?: string;
  cpmMax?: string;
}

export interface ViewTemplate {
  name: string;
  dimensions: DimensionKey[]; 
  fields: FieldKey[];
  filters: Filters;
  pageSize: number;
}

export type ExportPrimitive = string | number | boolean | null | undefined;
export type ExportRow = Record<string, ExportPrimitive>;
export type IndexableStatRow = StatRow & Record<string, ExportPrimitive>;
