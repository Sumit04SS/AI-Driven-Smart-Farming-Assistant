export interface SoilAdvisoryRequest {
  crop: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
}

export interface SoilSource {
  source: string;
  page: number | string;
  score?: number;
}

export interface SoilAdvisoryResponse {
  status: string;
  crop: string;
  soil_values: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
  };
  advisory: string;
  sources: SoilSource[];
  user: {
    id: number;
    name: string;
  };
}
