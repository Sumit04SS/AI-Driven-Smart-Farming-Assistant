export interface FarmAdvisorRequest {
  crop: string;
  crop_stage: string;
  city: string;
  country?: string | null;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
}

export interface FarmGuidanceSource {
  document: string;
  page?: number | string;
  score?: number;
}

export interface FarmGuidanceItem {
  message: string;
  source: FarmGuidanceSource;
}

export interface FarmAction {
  priority: 'high' | 'medium' | 'low';
  type: 'weather' | 'soil' | 'crop_stage';
  message: string;
  guidance?: FarmGuidanceItem[];
}

export interface FarmAdvisorResponse {
  status: string;
  crop: string;
  crop_stage: string;
  location: {
    city: string;
    country: string | null;
  };
  weather: any;
  soil: any;
  actions: FarmAction[];
  summary: string;
  user: {
    id: number;
    name: string;
  };
}
