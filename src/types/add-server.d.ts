export interface AdRequestPayload {
  geo?: string;     
  size?: string;    
  adType?: string;  
  cpm?: number;      
}

export interface AdResponse {
  id: number;
  crid: string;
  adm: string;      
  w: number;
  h: number;
  price: number;
  adomain: string[];
  adType: string;
  geo: string | null;
}
