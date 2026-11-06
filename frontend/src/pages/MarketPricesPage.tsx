import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Bell,
  Clock,
  Trash2,
  RefreshCw,
  Filter,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { marketService } from '../services/marketService';
import {
  Commodity,
  MarketMandi,
  MarketPricesResponse,
  MarketState,
  PriceAlertItem,
} from '../types/market';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AlertBanner } from '../components/common/AlertBanner';

export const MarketPricesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Filter selection state
  const [states, setStates] = useState<MarketState[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);

  const [markets, setMarkets] = useState<MarketMandi[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [commoditiesLoading, setCommoditiesLoading] = useState(false);
  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [commoditySearchTerm, setCommoditySearchTerm] = useState('');

  // Price results state
  const [priceData, setPriceData] = useState<MarketPricesResponse | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastSearchedParams, setLastSearchedParams] = useState<{
    stateName: string;
    marketName: string;
    commodityName: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Alerts state
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number>(2500);
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [creatingAlert, setCreatingAlert] = useState(false);
  const [checkingAlertId, setCheckingAlertId] = useState<number | null>(null);

  // Popular agricultural staple crops for quick 1-click selection
  const popularCrops = [
    { name: 'Wheat', id: 1 },
    { name: 'Paddy(Dhan)(Common)', id: 2 },
    { name: 'Cotton', id: 14 },
    { name: 'Onion', id: 23 },
    { name: 'Tomato', id: 78 },
    { name: 'Potato', id: 24 },
    { name: 'Soyabean', id: 28 },
    { name: 'Maize', id: 4 },
  ];

  // 1. Initial Load: States and Commodities
  useEffect(() => {
    let mounted = true;

    const loadInitialFilters = async () => {
      setStatesLoading(true);
      setCommoditiesLoading(true);

      try {
        const [statesRes, commoditiesRes] = await Promise.allSettled([
          marketService.getStates(),
          marketService.getCommodities(),
        ]);

        if (!mounted) return;

        if (statesRes.status === 'fulfilled' && statesRes.value.states) {
          const loadedStates = statesRes.value.states;
          setStates(loadedStates);

          // Default to Maharashtra (state_id: 20) if available, otherwise first state
          const maharashtra = loadedStates.find((s) => s.id === 20 || s.name.toLowerCase().includes('maharashtra'));
          if (maharashtra) {
            setSelectedStateId(maharashtra.id);
          } else if (loadedStates.length > 0) {
            setSelectedStateId(loadedStates[0].id);
          }
        } else {
          setError('Could not load Indian States from AGMARKNET. Please retry.');
        }

        if (commoditiesRes.status === 'fulfilled' && commoditiesRes.value.commodities) {
          const loadedCommodities = commoditiesRes.value.commodities;
          setCommodities(loadedCommodities);

          // Default to Wheat (commodity_id: 1) if available, otherwise first commodity
          const wheat = loadedCommodities.find((c) => c.id === 1 || c.name.toLowerCase() === 'wheat');
          if (wheat) {
            setSelectedCommodityId(wheat.id);
          } else if (loadedCommodities.length > 0) {
            setSelectedCommodityId(loadedCommodities[0].id);
          }
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to initialize market filters.');
      } finally {
        if (mounted) {
          setStatesLoading(false);
          setCommoditiesLoading(false);
        }
      }
    };

    loadInitialFilters();

    if (isAuthenticated) {
      fetchAlerts();
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // 2. Dependent Load: When selectedStateId changes, load markets for that state
  useEffect(() => {
    if (!selectedStateId) return;

    let mounted = true;
    setMarketsLoading(true);
    setMarkets([]); // Clear previous markets immediately to prevent stale selection

    marketService
      .getMarkets(selectedStateId)
      .then((res) => {
        if (!mounted) return;
        if (res.markets && res.markets.length > 0) {
          setMarkets(res.markets);

          // If in Maharashtra (state 20), default to APMC Achalpur (id: 570) if present
          if (selectedStateId === 20) {
            const achalpur = res.markets.find((m) => m.id === 570 || m.name.toLowerCase().includes('achalpur'));
            setSelectedMarketId(achalpur ? achalpur.id : res.markets[0].id);
          } else {
            setSelectedMarketId(res.markets[0].id);
          }
        } else {
          setMarkets([]);
          setSelectedMarketId(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Markets error:', err);
          setMarkets([]);
          setSelectedMarketId(null);
          setError(`Unable to load markets for selected state. Please try again.`);
        }
      })
      .finally(() => {
        if (mounted) setMarketsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedStateId]);

  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      const res = await marketService.getPriceAlerts();
      if (res.alerts) {
        setAlerts(res.alerts);
      }
    } catch (err: any) {
      console.error('Alerts error:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleFetchPrices = useCallback(async () => {
    if (!selectedCommodityId || !selectedStateId || !selectedMarketId) {
      setError('Please select state, market, and commodity before searching.');
      return;
    }

    const stateObj = states.find((s) => s.id === selectedStateId);
    const marketObj = markets.find((m) => m.id === selectedMarketId);
    const commodityObj = commodities.find((c) => c.id === selectedCommodityId);

    setError(null);
    setPricesLoading(true);

    try {
      const res = await marketService.getPrices(
        selectedCommodityId,
        selectedStateId,
        selectedMarketId
      );

      if (res.status === 'success' && res.market_data) {
        setPriceData(res);
        setLastSearchedParams({
          stateName: stateObj?.name || 'Selected State',
          marketName: marketObj?.name || 'Selected Market',
          commodityName: commodityObj?.name || 'Selected Commodity',
        });
      } else {
        setPriceData(null);
        setError('AGMARKNET did not return market data.');
      }
    } catch (err: any) {
      setPriceData(null);
      setError(err.message || 'Unable to retrieve AGMARKNET market prices. Server may be temporarily busy.');
    } finally {
      setPricesLoading(false);
    }
  }, [selectedCommodityId, selectedStateId, selectedMarketId, states, markets, commodities]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommodityId || !selectedStateId || !selectedMarketId) return;

    const commodityObj = commodities.find((c) => c.id === selectedCommodityId);
    const marketObj = markets.find((m) => m.id === selectedMarketId);

    if (!commodityObj || !marketObj) return;

    try {
      setCreatingAlert(true);
      await marketService.createPriceAlert({
        commodity_id: selectedCommodityId,
        commodity_name: commodityObj.name,
        state_id: selectedStateId,
        market_id: selectedMarketId,
        market_name: marketObj.name,
        target_price: targetPrice,
        condition: alertCondition,
      });
      setIsAlertModalOpen(false);
      setSuccessMsg(`Price alert created for ${commodityObj.name} at ${marketObj.name}!`);
      fetchAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to create price alert.');
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleCheckAlertNow = async (alertId: number) => {
    try {
      setCheckingAlertId(alertId);
      const res = await marketService.checkPriceAlert(alertId);
      setSuccessMsg(res.message);
      fetchAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to check price alert.');
    } finally {
      setCheckingAlertId(null);
    }
  };

  const handleDeactivateAlert = async (alertId: number) => {
    try {
      await marketService.deactivatePriceAlert(alertId);
      setSuccessMsg('Price alert deactivated successfully.');
      fetchAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate price alert.');
    }
  };

  // Filtered commodities list based on search term
  const filteredCommodities = useMemo(() => {
    if (!commoditySearchTerm.trim()) return commodities;
    const lower = commoditySearchTerm.toLowerCase();
    return commodities.filter((c) => c.name.toLowerCase().includes(lower));
  }, [commodities, commoditySearchTerm]);

  const selectedStateName = states.find((s) => s.id === selectedStateId)?.name || '';
  const selectedMarketName = markets.find((m) => m.id === selectedMarketId)?.name || '';
  const selectedCommodityName = commodities.find((c) => c.id === selectedCommodityId)?.name || '';

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Header */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">
            AGMARKNET Daily Mandi Feed
          </Badge>
          <Badge variant="blue" size="sm">
            Ministry of Agriculture & Farmers Welfare
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Mandi Market Prices & Automated Alerts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Search real-time weekly commodity arrivals and modal prices across agricultural markets (mandis) in India, with customizable target alerts.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {successMsg && <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Cascading Filter Selection Card */}
      <Card
        title="Mandi Query & Filter Controls"
        subtitle="Select state, regulated market, and commodity"
        icon={<Filter className="w-5 h-5" />}
      >
        {/* Popular Staples Quick Selector */}
        <div className="mb-5 pb-4 border-b border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Popular Crop Shortcuts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {popularCrops.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => {
                  setSelectedCommodityId(crop.id);
                  setCommoditySearchTerm('');
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  selectedCommodityId === crop.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {crop.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. State Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              1. State {statesLoading && <span className="text-emerald-600 text-[10px] font-normal animate-pulse">(Loading...)</span>}
            </label>
            <select
              value={selectedStateId || ''}
              onChange={(e) => setSelectedStateId(Number(e.target.value))}
              disabled={statesLoading || states.length === 0}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              {states.length === 0 ? (
                <option value="">{statesLoading ? 'Loading states...' : 'No states available'}</option>
              ) : (
                states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 2. Mandi Market Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Mandi Market {marketsLoading && <span className="text-emerald-600 text-[10px] font-normal animate-pulse">(Loading mandis...)</span>}
            </label>
            <select
              value={selectedMarketId || ''}
              onChange={(e) => setSelectedMarketId(Number(e.target.value))}
              disabled={marketsLoading || markets.length === 0}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              {marketsLoading ? (
                <option value="">Fetching mandis for this state...</option>
              ) : markets.length === 0 ? (
                <option value="">No markets found in this state</option>
              ) : (
                markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 3. Commodity Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Commodity {commoditiesLoading && <span className="text-emerald-600 text-[10px] font-normal animate-pulse">(Loading...)</span>}
            </label>
            <select
              value={selectedCommodityId || ''}
              onChange={(e) => setSelectedCommodityId(Number(e.target.value))}
              disabled={commoditiesLoading || commodities.length === 0}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              {commodities.length === 0 ? (
                <option value="">{commoditiesLoading ? 'Loading commodities...' : 'No commodities available'}</option>
              ) : (
                filteredCommodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            onClick={handleFetchPrices}
            loading={pricesLoading}
            disabled={!selectedCommodityId || !selectedStateId || !selectedMarketId || marketsLoading}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Fetch Live Mandi Prices
          </Button>

          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => setIsAlertModalOpen(true)}
              disabled={!selectedCommodityId || !selectedStateId || !selectedMarketId}
              icon={<Bell className="w-4 h-4 text-emerald-600" />}
            >
              Set Price Alert for this Mandi
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Price Table Area */}
        <div className="lg:col-span-8 space-y-6">
          {pricesLoading && (
            <Card className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800 animate-pulse">
                Querying AGMARKNET Gateway for {selectedCommodityName} in {selectedMarketName}...
              </p>
              <p className="text-xs text-slate-400">
                Fetching weekly arrivals and daily modal price records...
              </p>
            </Card>
          )}

          {!pricesLoading && priceData && (
            <Card
              title={priceData.market_data.title || `${lastSearchedParams?.commodityName || selectedCommodityName} Prices`}
              subtitle={`Market: ${lastSearchedParams?.marketName || selectedMarketName}, ${lastSearchedParams?.stateName || selectedStateName}`}
              icon={<TrendingUp className="w-5 h-5" />}
            >
              {priceData.market_data.prices.length === 0 ? (
                /* Honest and helpful Empty State */
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200/60">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      No Arrivals Reported for {lastSearchedParams?.commodityName || selectedCommodityName}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                      APMC {lastSearchedParams?.marketName || selectedMarketName} did not report any arrivals or transactions for {lastSearchedParams?.commodityName || selectedCommodityName} in the past 7 days.
                    </p>
                  </div>
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="text-slate-400">Try popular commodities:</span>
                    <button
                      onClick={() => {
                        setSelectedCommodityId(1);
                        handleFetchPrices();
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md font-medium text-slate-700 transition-colors"
                    >
                      Check Wheat
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCommodityId(23);
                        handleFetchPrices();
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md font-medium text-slate-700 transition-colors"
                    >
                      Check Onion
                    </button>
                  </div>
                </div>
              ) : (
                /* Verified Price Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Arrival Date</th>
                        <th className="py-3 px-4">Variety</th>
                        <th className="py-3 px-4">Modal Price</th>
                        <th className="py-3 px-4">Unit of Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {priceData.market_data.prices.map((record, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {record.date}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{record.variety || 'Standard / Other'}</td>
                          <td className="py-3 px-4 font-bold text-emerald-700 text-sm">
                            ₹{record.price}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{record.unit || 'Rs./Quintal'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {!pricesLoading && !priceData && !error && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <TrendingUp className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="font-semibold text-slate-700 text-sm">Ready to Query Mandi Rates</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use the filters above to pick an Indian state, mandi market, and commodity, then click "Fetch Live Mandi Prices".
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: Active Price Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            title="My Price Alerts"
            subtitle={`${alerts.length} active target monitor${alerts.length === 1 ? '' : 's'}`}
            icon={<Bell className="w-5 h-5" />}
          >
            {alertsLoading ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-medium text-slate-600">No active price alerts</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set alerts to receive automatic notifications when mandi prices hit your targets.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {alerts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.commodity}</span>
                      <Badge variant={item.active ? (item.triggered ? 'amber' : 'emerald') : 'slate'} size="sm">
                        {item.triggered ? 'Triggered!' : item.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>Mandi: <span className="font-semibold text-slate-800">{item.market}</span></p>
                      <p>Target: <span className="font-semibold text-emerald-700">₹{item.target_price}</span> ({item.condition})</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        onClick={() => handleCheckAlertNow(item.id)}
                        disabled={checkingAlertId === item.id}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${checkingAlertId === item.id ? 'animate-spin' : ''}`} />
                        Check Now
                      </button>

                      <button
                        onClick={() => handleDeactivateAlert(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Deactivate alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Set Price Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Set Automated Mandi Price Alert"
        subtitle={`Subscribe for notifications when ${selectedCommodityName} reaches target price`}
      >
        <form onSubmit={handleCreateAlert} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <p><span className="text-slate-500">Commodity:</span> <span className="font-bold text-slate-900">{selectedCommodityName}</span></p>
            <p><span className="text-slate-500">Market:</span> <span className="font-bold text-slate-900">{selectedMarketName}</span> ({selectedStateName})</p>
          </div>

          <Input
            label="Target Price (₹ per Quintal)"
            type="number"
            min="1"
            value={targetPrice}
            onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
            required
            helperText="e.g. 2500"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Alert Trigger Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAlertCondition('above')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  alertCondition === 'above'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Price is ABOVE Target (Selling)
              </button>
              <button
                type="button"
                onClick={() => setAlertCondition('below')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  alertCondition === 'below'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Price is BELOW Target (Buying)
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAlertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={creatingAlert}
              icon={<Bell className="w-4 h-4" />}
            >
              Confirm Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
