import React, { useEffect, useState } from 'react';
import {
  Tractor,
  Search,
  PlusCircle,
  Calculator,
  Inbox,
  MapPin,
} from 'lucide-react';
import { equipmentService } from '../services/equipmentService';
import {
  EquipmentCreateRequest,
  EquipmentItem,
  EquipmentSearchRequest,
  RentalDealResponse,
  RentalRequestItem,
} from '../types/equipment';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AlertBanner } from '../components/common/AlertBanner';

export const EquipmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'list' | 'requests'>('search');

  // Search state
  const [searchParams, setSearchParams] = useState<EquipmentSearchRequest>({
    equipment_type: 'Tractor',
    city: 'Nashik',
  });
  const [searchResults, setSearchResults] = useState<EquipmentItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Listing state
  const [listingForm, setListingForm] = useState<EquipmentCreateRequest>({
    equipment_type: 'Tractor',
    brand: 'Mahindra',
    model: '575 DI',
    rental_price_per_day: 1200,
    city: 'Nashik',
    available: true,
  });
  const [listingLoading, setListingLoading] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<RentalRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Deal Calculator Modal state
  const [selectedEquipmentForDeal, setSelectedEquipmentForDeal] = useState<EquipmentItem | null>(null);
  const [dealDays, setDealDays] = useState<number>(3);
  const [dealAlternativeCost, setDealAlternativeCost] = useState<number>(4500);
  const [dealResult, setDealResult] = useState<RentalDealResponse | null>(null);
  const [dealLoading, setDealLoading] = useState(false);

  // Messages
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const equipmentTypes = ['Tractor', 'Harvester', 'Rotavator', 'Seeder', 'Sprayer', 'Baler', 'Thresher'];

  // Initial search and requests
  useEffect(() => {
    handleSearch();
    fetchRequests();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSearching(true);
    try {
      const res = await equipmentService.searchEquipment(searchParams);
      if (res.results) {
        setSearchResults(res.results);
      }
      setSearchPerformed(true);
    } catch (err: any) {
      setError(err.message || 'Equipment search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setListingLoading(true);
    try {
      await equipmentService.createEquipment(listingForm);
      setSuccessMsg(`Successfully listed ${listingForm.equipment_type} for rental!`);
      setActiveTab('search');
      handleSearch();
    } catch (err: any) {
      setError(err.message || 'Failed to list equipment.');
    } finally {
      setListingLoading(false);
    }
  };

  const handleRequestRental = async (equipmentId: number) => {
    setError(null);
    try {
      await equipmentService.createRentalRequest({ equipment_id: equipmentId });
      setSuccessMsg('Rental request sent to owner!');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to send rental request.');
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await equipmentService.getRentalRequests();
      if (res.requests) {
        setRequests(res.requests);
      }
    } catch (err: any) {
      console.error('Failed to load rental requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: number, status: 'accepted' | 'rejected') => {
    setError(null);
    try {
      await equipmentService.updateRentalRequest(requestId, status);
      setSuccessMsg(`Rental request ${status} successfully.`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to update request.');
    }
  };

  const handleCalculateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentForDeal) return;
    setDealLoading(true);
    try {
      const res = await equipmentService.checkDeal({
        equipment_id: selectedEquipmentForDeal.id,
        rental_days: dealDays,
        alternative_cost: dealAlternativeCost,
      });
      setDealResult(res);
    } catch (err: any) {
      setError(err.message || 'Deal calculation error.');
    } finally {
      setDealLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Header */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">
            Farmer-to-Farmer Marketplace
          </Badge>
          <Badge variant="blue" size="sm">
            Break-Even & Savings Calculator
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Peer-to-Peer Equipment Sharing Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Share agricultural machinery, discover tractors and harvesters available near your village, and evaluate financial deal viability.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {successMsg && <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'search'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          Browse Machinery
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'list'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          List Equipment
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Rental Requests ({requests.length})
        </button>
      </div>

      {/* Tab 1: Search & Browse */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <Card title="Locate Equipment Near You" icon={<Search className="w-5 h-5" />}>
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Equipment Category
                </label>
                <select
                  value={searchParams.equipment_type}
                  onChange={(e) =>
                    setSearchParams((prev) => ({ ...prev, equipment_type: e.target.value }))
                  }
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                >
                  {equipmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City / Taluka"
                value={searchParams.city}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="e.g. Nashik"
                required
              />

              <div className="flex items-end">
                <Button type="submit" loading={searching} className="w-full" icon={<Search className="w-4 h-4" />}>
                  Search Equipment
                </Button>
              </div>
            </form>
          </Card>

          {/* Search Results Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Available Machinery in {searchParams.city} ({searchResults.length})
            </h3>

            {searching ? (
              <div className="py-12 text-center text-xs text-slate-400">Searching marketplace registry...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
                <Tractor className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                <h4 className="font-semibold text-slate-700 text-sm">No machinery listed in this city yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Be the first farmer to list your tractor or implement in {searchParams.city} using the "List Equipment" tab.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((item) => (
                  <Card key={item.id} className="flex flex-col justify-between hover:border-emerald-200 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="emerald" size="sm">
                          {item.available ? 'Available Now' : 'Currently Rented'}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.city}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          {item.equipment_type}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.brand || 'Standard'} {item.model || ''}
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-baseline justify-between">
                        <span className="text-xs text-emerald-800 font-medium">Daily Rental:</span>
                        <span className="text-lg font-black text-emerald-700">
                          ₹{item.rental_price_per_day}
                          <span className="text-xs font-normal text-slate-500"> /day</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipmentForDeal(item);
                          setDealResult(null);
                        }}
                        icon={<Calculator className="w-3.5 h-3.5" />}
                      >
                        Deal Check
                      </Button>

                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRequestRental(item.id)}
                        disabled={!item.available}
                      >
                        Request Rent
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: List Equipment */}
      {activeTab === 'list' && (
        <Card
          title="List Agricultural Machinery for Rent"
          subtitle="Monetize idle tractors, harvesters, or attachments by renting to neighboring farmers"
          icon={<PlusCircle className="w-5 h-5" />}
        >
          <form onSubmit={handleCreateListing} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Equipment Type
              </label>
              <select
                value={listingForm.equipment_type}
                onChange={(e) =>
                  setListingForm((prev) => ({ ...prev, equipment_type: e.target.value }))
                }
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
              >
                {equipmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Brand / Manufacturer"
                value={listingForm.brand || ''}
                onChange={(e) => setListingForm((prev) => ({ ...prev, brand: e.target.value }))}
                placeholder="e.g. Mahindra, John Deere"
              />
              <Input
                label="Model Number"
                value={listingForm.model || ''}
                onChange={(e) => setListingForm((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. 575 DI"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rental Rate per Day (₹)"
                type="number"
                min="1"
                value={listingForm.rental_price_per_day}
                onChange={(e) =>
                  setListingForm((prev) => ({
                    ...prev,
                    rental_price_per_day: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                helperText="₹ Indian Rupees"
              />
              <Input
                label="Stationed City / Taluka"
                value={listingForm.city}
                onChange={(e) => setListingForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="e.g. Nashik"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-4"
              loading={listingLoading}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Publish Equipment Listing
            </Button>
          </form>
        </Card>
      )}

      {/* Tab 3: Rental Requests */}
      {activeTab === 'requests' && (
        <Card
          title="Rental Requests & Work Orders"
          subtitle="Track inbound requests from other farmers or equipment you requested"
          icon={<Inbox className="w-5 h-5" />}
        >
          {requestsLoading ? (
            <p className="text-xs text-slate-400 text-center py-8">Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium text-slate-600">No active rental requests</p>
              <p className="text-xs text-slate-400 mt-1">Browse machinery and request a rental to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Equipment</th>
                    <th className="py-3 px-4">Daily Rate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr key={req.request_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-500">
                        #{req.request_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {req.equipment_type} ({req.brand || 'Generic'} {req.model || ''})
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-700">
                        ₹{req.rental_price_per_day}/day
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            req.status === 'accepted'
                              ? 'emerald'
                              : req.status === 'rejected'
                              ? 'rose'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {req.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.request_id, 'accepted')}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.request_id, 'rejected')}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Deal Calculator Modal */}
      {selectedEquipmentForDeal && (
        <Modal
          isOpen={!!selectedEquipmentForDeal}
          onClose={() => setSelectedEquipmentForDeal(null)}
          title={`Financial Deal Check: ${selectedEquipmentForDeal.equipment_type}`}
          subtitle={`Rate: ₹${selectedEquipmentForDeal.rental_price_per_day}/day`}
        >
          <form onSubmit={handleCalculateDeal} className="space-y-4 text-xs sm:text-sm">
            <Input
              label="Planned Rental Days"
              type="number"
              min="1"
              value={dealDays}
              onChange={(e) => setDealDays(parseInt(e.target.value) || 1)}
              required
              helperText="Duration of field work"
            />

            <Input
              label="Alternative Cost (₹)"
              type="number"
              min="0"
              value={dealAlternativeCost}
              onChange={(e) => setDealAlternativeCost(parseFloat(e.target.value) || 0)}
              required
              helperText="Cost of hiring commercial contractor or buying machine"
            />

            <Button
              type="submit"
              className="w-full mt-2"
              loading={dealLoading}
              icon={<Calculator className="w-4 h-4" />}
            >
              Analyze Cost & Savings
            </Button>

            {dealResult && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    dealResult.calculation.savings >= 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Recommendation:</span>
                    <Badge variant={dealResult.calculation.savings >= 0 ? 'emerald' : 'rose'}>
                      {dealResult.calculation.decision.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="leading-relaxed font-medium">{dealResult.calculation.message}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/10 text-center text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Rental Cost</span>
                      <span className="font-bold">₹{dealResult.calculation.rental_cost}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Alternative</span>
                      <span className="font-bold">₹{dealResult.calculation.alternative_cost}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Net Savings</span>
                      <span className="font-bold text-emerald-700">₹{dealResult.calculation.savings}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};
