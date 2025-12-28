import React, { useState, useEffect } from 'react';
import { FaGift, FaUsers, FaCog, FaSync, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';

const LoyaltySettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/loyalty/settings');
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load loyalty settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.put('/loyalty/settings', settings);
      toast.success('Loyalty settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProcessRewards = async () => {
    try {
      setProcessing(true);
      const { data } = await API.post('/loyalty/process-rewards');
      toast.success(`Processed ${data.processed} orders successfully`);
      if (data.errors && data.errors.length > 0) {
        toast.warning(`${data.errors.length} orders had errors`);
      }
    } catch (error) {
      console.error('Error processing rewards:', error);
      toast.error('Failed to process rewards');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A0F1B]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Loyalty & Rewards Settings</h2>
            <p className="text-gray-600 mt-1">Configure loyalty points and referral rewards</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleProcessRewards}
              disabled={processing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaSync /> Process Pending Rewards
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Purchase Rewards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaGift /> Purchase Rewards
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.purchaseRewardEnabled || false}
                    onChange={(e) => handleChange('purchaseRewardEnabled', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="font-semibold text-gray-900">Enable Purchase Rewards</span>
                </label>
                <p className="text-sm text-gray-500 ml-8 mt-1">
                  Reward customers with points on each purchase
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reward Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings?.purchaseRewardPercentage || 0}
                    onChange={(e) => handleChange('purchaseRewardPercentage', parseFloat(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <span className="text-gray-600 font-semibold">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of order value credited as points
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={settings?.minOrderAmountForReward || 0}
                    onChange={(e) => handleChange('minOrderAmountForReward', parseFloat(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Minimum order value to earn rewards (0 for no minimum)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings?.refundPeriodDays || 0}
                  onChange={(e) => handleChange('refundPeriodDays', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Days to wait before crediting rewards (to allow for refunds)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Rewards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUsers /> Referral Rewards
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.referralRewardEnabled || false}
                    onChange={(e) => handleChange('referralRewardEnabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-900">Enable Referral Rewards</span>
                </label>
                <p className="text-sm text-gray-500 ml-8 mt-1">
                  Reward users when their referrals make purchases
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Referral Reward Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings?.referralRewardPercentage || 0}
                    onChange={(e) => handleChange('referralRewardPercentage', parseFloat(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-600 font-semibold">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of referred user's order value given to referrer
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Referral Code Expiry (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={settings?.referralCodeExpiry || 0}
                  onChange={(e) => handleChange('referralCodeExpiry', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Days until referral code expires (0 for no expiry)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Referrals Per User
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings?.maxReferralsPerUser || 0}
                  onChange={(e) => handleChange('maxReferralsPerUser', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum referrals allowed per user (0 for unlimited)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Point Redemption */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaCog /> Point Redemption Settings
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.pointRedemptionEnabled || false}
                    onChange={(e) => handleChange('pointRedemptionEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-900">Enable Point Redemption</span>
                </label>
                <p className="text-sm text-gray-500 ml-8 mt-1">
                  Allow customers to use points for purchases
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Point Value (₹ per point)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-semibold">₹</span>
                  <input
                    type="number"
                    min="0.01"
                    max="10"
                    step="0.01"
                    value={settings?.pointValue || 1}
                    onChange={(e) => handleChange('pointValue', parseFloat(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Rupee value of each point (e.g., 1 point = ₹1)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Points for Redemption
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={settings?.minPointsForRedemption || 0}
                  onChange={(e) => handleChange('minPointsForRedemption', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum points required to redeem
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Redemption Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={settings?.maxRedemptionPercentage || 50}
                    onChange={(e) => handleChange('maxRedemptionPercentage', parseInt(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="text-gray-600 font-semibold">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum % of order value that can be paid using points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* First Purchase Bonus */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaGift /> First Purchase Bonus
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.firstPurchaseBonusEnabled || false}
                    onChange={(e) => handleChange('firstPurchaseBonusEnabled', e.target.checked)}
                    className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                  <span className="font-semibold text-gray-900">Enable First Purchase Bonus</span>
                </label>
                <p className="text-sm text-gray-500 ml-8 mt-1">
                  Give bonus points on first purchase
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bonus Points
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={settings?.firstPurchaseBonusPoints || 0}
                  onChange={(e) => handleChange('firstPurchaseBonusPoints', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Bonus points for first purchase
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white rounded-lg hover:from-[#6A1525] hover:to-[#8A1F35] transition disabled:opacity-50 flex items-center gap-3 font-bold text-lg shadow-xl"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving Changes...
              </>
            ) : (
              <>
                <FaSave /> Save All Settings
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LoyaltySettings;
