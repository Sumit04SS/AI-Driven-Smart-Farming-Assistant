export interface EquipmentItem {
  id: number;
  equipment_type: string;
  brand?: string | null;
  model?: string | null;
  rental_price_per_day: number;
  city: string;
  available: boolean;
}

export interface EquipmentCreateRequest {
  equipment_type: string;
  brand?: string;
  model?: string;
  rental_price_per_day: number;
  city: string;
  latitude?: number;
  longitude?: number;
  available?: boolean;
}

export interface EquipmentSearchRequest {
  equipment_type: string;
  city: string;
}

export interface RentalDealRequest {
  equipment_id: number;
  rental_days: number;
  alternative_cost: number;
}

export interface RentalDealResponse {
  status: string;
  equipment: {
    id: number;
    equipment_type: string;
    brand?: string | null;
    model?: string | null;
    rental_price_per_day: number;
  };
  calculation: {
    rental_days: number;
    rental_cost: number;
    alternative_cost: number;
    savings: number;
    decision: 'rent' | 'alternative';
    message: string;
  };
}

export interface RentalRequestItem {
  request_id: number;
  equipment_id: number;
  equipment_type: string;
  brand?: string | null;
  model?: string | null;
  rental_price_per_day: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
}

export interface RentalRequestCreate {
  equipment_id: number;
}
