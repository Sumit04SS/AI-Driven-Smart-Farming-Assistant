export interface CropRecommendationRequest {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropRecommendationItem {
  crop: string;
  confidence: number;
}

export interface CropRecommendationResponse {
  status: string;
  recommended_crop: string;
  confidence: number;
  top_recommendations: CropRecommendationItem[];
  explanation: string;
  guidance_source: string;
  user: {
    id: number;
    name: string;
  };
}
