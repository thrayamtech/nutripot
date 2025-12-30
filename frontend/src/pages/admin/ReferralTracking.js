import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaPhone, FaEnvelope, FaCheckCircle, FaClock, FaGift, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';

const ReferralTracking = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const { data } = await API.get(`/referral/admin/all?${params.toString()}`);
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pending', icon: FaClock },
      registered: { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Registered', icon: FaCheckCircle },
      active: { color: 'bg-green-100 text-green-800 border-green-300', text: 'Active', icon: FaCheckCircle },
      completed: { color: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Completed', icon: FaCheckCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="text-xs" />
        {config.text}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Referrer Name', 'Referrer Phone', 'Friend Name', 'Friend WhatsApp', 'Status', 'Total Rewards', 'Purchases', 'Created Date'];
    const rows = referrals.map(r => [
      r.referrer.name,
      r.referrer.phone,
      r.friendName,
      r.friendWhatsApp,
      r.status,
      r.totalRewardEarned,
      r.purchaseCount,
      new Date(r.createdAt).toLocaleDateString('en-IN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Referrals exported successfully!');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Tracking</h1>
          <p className="text-gray-600">View and manage all customer referrals</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <FaUsers className="text-2xl text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-md border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-2xl text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-md border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.registered}</p>
              <p className="text-sm text-gray-600">Registered</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 shadow-md border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <FaGift className="text-2xl text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700">{stats.totalRewardsDistributed}</p>
              <p className="text-sm text-gray-600">Total Rewards</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="registered">Registered</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <button
                onClick={exportToCSV}
                disabled={referrals.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A0F1B]"></div>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaUsers className="text-5xl mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No referrals found</p>
              <p className="text-sm mt-2">Referrals will appear here once users start referring friends</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Friend Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Purchases
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rewards Earned
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{referral.referrer.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <FaPhone className="text-xs" />
                            <span>{referral.referrer.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FaEnvelope className="text-xs" />
                            <span className="truncate max-w-[200px]">{referral.referrer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{referral.friendName}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <FaPhone className="text-xs text-green-600" />
                            <span className="font-medium">{referral.friendWhatsApp}</span>
                          </div>
                          {referral.registeredUser && (
                            <div className="mt-1">
                              <p className="text-xs text-blue-600">
                                Registered: {referral.registeredUser.name}
                              </p>
                              <p className="text-xs text-gray-500">{referral.registeredUser.email}</p>
                            </div>
                          )}
                          {referral.notes && (
                            <p className="text-xs text-gray-500 italic mt-1">"{referral.notes}"</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(referral.status)}
                        {referral.registeredAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reg: {new Date(referral.registeredAt).toLocaleDateString('en-IN')}
                          </p>
                        )}
                        {referral.activatedAt && (
                          <p className="text-xs text-gray-500">
                            Active: {new Date(referral.activatedAt).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{referral.purchaseCount}</p>
                          <p className="text-xs text-gray-500">purchases</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-lg font-bold text-green-600">₹{referral.totalRewardEarned}</p>
                          <p className="text-xs text-gray-500">{referral.totalRewardEarned} points</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(referral.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(referral.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Purchase Details Modal/Expandable Section - Could be added for detailed view */}
        {referrals.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Click on any referral to view detailed purchase history and reward breakdown.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReferralTracking;
