export interface MarketState {
  id: number;
  name: string;
}

export interface MarketMandi {
  id: number;
  name: string;
  district_id?: number;
}

export interface Commodity {
  id: number;
  name: string;
  group_id?: number;
}

export interface PriceRecord {
  date: string;
  variety: string;
  price: string | number;
  unit: string;
}

export interface MarketPricesResponse {
  status: string;
  source: string;
  filters: {
    commodity_id: number;
    state_id: number;
    market_id: number;
  };
  market_data: {
    title?: string;
    prices: PriceRecord[];
  };
}

export interface PriceAlertCreate {
  commodity_id: number;
  commodity_name: string;
  state_id: number;
  market_id: number;
  market_name: string;
  target_price: number;
  condition: 'above' | 'below';
}

export interface PriceAlertItem {
  id: number;
  commodity: string;
  market: string;
  target_price: number;
  condition: 'above' | 'below';
  active: boolean;
  triggered: boolean;
  created_at?: string;
}

export interface PriceAlertCheckResponse {
  status: string;
  triggered: boolean;
  message: string;
}
