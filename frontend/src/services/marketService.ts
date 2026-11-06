import api from './api';
import {
  Commodity,
  MarketMandi,
  MarketPricesResponse,
  MarketState,
  PriceAlertCheckResponse,
  PriceAlertCreate,
  PriceAlertItem,
} from '../types/market';

export const marketService = {
  async getStates(): Promise<{ status: string; source: string; states: MarketState[] }> {
    const res = await api.get<{ status: string; source: string; states: MarketState[] }>('/market/states');
    return res.data;
  },

  async getMarkets(stateId: number): Promise<{ status: string; source: string; state_id: number; markets: MarketMandi[] }> {
    const res = await api.get<{ status: string; source: string; state_id: number; markets: MarketMandi[] }>('/market/markets', {
      params: { state_id: stateId },
    });
    return res.data;
  },

  async getCommodities(): Promise<{ status: string; source: string; commodities: Commodity[] }> {
    const res = await api.get<{ status: string; source: string; commodities: Commodity[] }>('/market/commodities');
    return res.data;
  },

  async getPrices(commodityId: number, stateId: number, marketId: number): Promise<MarketPricesResponse> {
    const res = await api.get<MarketPricesResponse>('/market/prices', {
      params: {
        commodity_id: commodityId,
        state_id: stateId,
        market_id: marketId,
      },
    });
    return res.data;
  },

  async createPriceAlert(data: PriceAlertCreate): Promise<{ status: string; message: string; alert: PriceAlertItem }> {
    const res = await api.post<{ status: string; message: string; alert: PriceAlertItem }>('/market/price-alert', data);
    return res.data;
  },

  async getPriceAlerts(): Promise<{ status: string; alerts: PriceAlertItem[] }> {
    const res = await api.get<{ status: string; alerts: PriceAlertItem[] }>('/market/price-alerts');
    return res.data;
  },

  async deactivatePriceAlert(alertId: number): Promise<{ status: string; message: string; alert?: PriceAlertItem }> {
    const res = await api.delete<{ status: string; message: string; alert?: PriceAlertItem }>(`/market/price-alert/${alertId}`);
    return res.data;
  },

  async checkPriceAlert(alertId: number): Promise<PriceAlertCheckResponse> {
    const res = await api.post<PriceAlertCheckResponse>(`/market/price-alert/${alertId}/check`);
    return res.data;
  },
};
