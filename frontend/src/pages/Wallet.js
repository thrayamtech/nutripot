import React, { useState, useEffect } from 'react';
import { FaWallet, FaGift, FaUsers, FaHistory, FaCoins, FaArrowUp, FaArrowDown, FaPhone, FaCheckCircle, FaClock, FaInfoCircle, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
    fetchReferralData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, statsRes, transactionsRes] = await Promise.all([
        API.get('/wallet'),
        API.get('/wallet/stats'),
        API.get('/wallet/transactions?limit=50')
      ]);

      setWallet(walletRes.data.wallet);
      setStats(statsRes.data.stats);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralData = async () => {
    try {
      const { data } = await API.get('/referral/my-referrals');
      setReferrals(data.referrals);
      setReferralStats(data.stats);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase_reward':
        return <FaGift className="text-green-500" />;
      case 'referral_reward':
        return <FaUsers className="text-blue-500" />;
      case 'redemption':
        return <FaArrowDown className="text-red-500" />;
      case 'refund':
        return <FaArrowUp className="text-green-500" />;
      default:
        return <FaCoins className="text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'purchase_reward':
      case 'referral_reward':
      case 'refund':
        return 'text-green-600';
      case 'redemption':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: FaClock, color: 'bg-yellow-100 text-yellow-800 border border-yellow-300', text: 'Pending' },
      registered: { icon: FaCheckCircle, color: 'bg-blue-100 text-blue-800 border border-blue-300', text: 'Registered' },
      active: { icon: FaCheckCircle, color: 'bg-green-100 text-green-800 border border-green-300', text: 'Active' },
      completed: { icon: FaCheckCircle, color: 'bg-amber-100 text-amber-800 border border-amber-300', text: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="text-xs" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A0F1B]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Wallet</h1>
          <p className="text-sm text-gray-600">Manage your rewards and referrals</p>
        </div>

        {/* How to Earn Points - Info Banner */}
        <div className="bg-gradient-to-r from-[#5A0F1B]/5 to-[#8A1F35]/5 border-2 border-[#5A0F1B]/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-[#5A0F1B] text-xl mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">How to Earn Points:</h3>
              <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <FaGift className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Purchase Rewards:</strong> Earn points on every purchase (after refund period)</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaUsers className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Referral Rewards:</strong> Earn when your referred friends make purchases</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">💡 Use points at checkout to get discounts on your next purchase! 1 Point = ₹1</p>
            </div>
          </div>
        </div>

        {/* Balance Cards - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#5A0F1B] to-[#7A1525] rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <FaWallet className="text-2xl opacity-80" />
              <span className="text-xs opacity-80">Available Balance</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.balance || 0} <span className="text-lg">pts</span>
            </div>
            <div className="text-xs opacity-80">
              ≈ ₹{stats?.balance || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <FaGift className="text-2xl text-green-500" />
              <span className="text-xs text-gray-600">Purchase Rewards</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.purchaseRewards || 0} <span className="text-sm">pts</span>
            </div>
            <div className="text-xs text-gray-500">
              From your purchases
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <FaUsers className="text-2xl text-blue-500" />
              <span className="text-xs text-gray-600">Referral Rewards</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.referralRewards || 0} <span className="text-sm">pts</span>
            </div>
            <div className="text-xs text-gray-500">
              From referrals
            </div>
          </div>
        </div>

        {/* Stats Summary - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-0.5">Total Earned</p>
            <p className="text-xl font-bold text-green-600">{stats?.totalEarned || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-0.5">Total Redeemed</p>
            <p className="text-xl font-bold text-red-600">{stats?.totalRedeemed || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-0.5">Pending Rewards</p>
            <p className="text-xl font-bold text-yellow-600">{stats?.pendingRewards || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-0.5">Referrals</p>
            <p className="text-xl font-bold text-blue-600">{referralStats?.totalReferrals || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-5 py-3 font-semibold transition text-sm ${
                  activeTab === 'overview'
                    ? 'bg-[#5A0F1B] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaHistory className="inline mr-2 text-xs" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('referral')}
                className={`flex-1 px-5 py-3 font-semibold transition text-sm ${
                  activeTab === 'referral'
                    ? 'bg-[#5A0F1B] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaUsers className="inline mr-2 text-xs" />
                Referrals
              </button>
            </div>
          </div>

          <div className="p-5">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Transaction History</h3>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No transactions yet</p>
                    <p className="text-xs mt-1">Start shopping to earn rewards!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.map((transaction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xl">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-base font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance: {transaction.balanceAfter}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'referral' && (
              <div>
                {/* Refer a Friend CTA */}
                <div className="bg-gradient-to-r from-[#5A0F1B]/5 to-[#8A1F35]/5 rounded-lg p-4 mb-4 border border-[#5A0F1B]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] rounded-lg">
                        <FaUserPlus className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">Want to Earn More?</h3>
                        <p className="text-xs text-gray-600">Refer friends and earn rewards on their purchases</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/refer-friend')}
                      className="px-4 py-2 bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] text-white rounded-lg hover:shadow-lg transition font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <FaUserPlus className="text-xs" /> Refer Now
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3">Referral Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                    <p className="text-xl font-bold text-blue-600">{referralStats?.totalReferrals || 0}</p>
                    <p className="text-xs text-gray-600">Total Referrals</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                    <p className="text-xl font-bold text-yellow-600">{referralStats?.pendingReferrals || 0}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <p className="text-xl font-bold text-green-600">{referralStats?.activeReferrals || 0}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#5A0F1B]/10 to-[#8A1F35]/10 rounded-lg p-3 text-center border border-[#5A0F1B]/20">
                    <p className="text-xl font-bold text-[#5A0F1B]">{referralStats?.totalRewardsEarned || 0}</p>
                    <p className="text-xs text-gray-600">Points Earned</p>
                  </div>
                </div>

                {referrals && referrals.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Your Referrals</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg p-3 border border-[#5A0F1B]/10 hover:border-[#5A0F1B]/30 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{referral.friendName}</h4>
                                {getStatusBadge(referral.status)}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                <FaPhone className="text-[10px] text-green-600" />
                                <span>{referral.whatsapp}</span>
                              </div>
                              {referral.registeredUser && (
                                <p className="text-xs text-blue-600">
                                  ✓ Registered: <span className="font-semibold">{referral.registeredUser.name}</span>
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span>{referral.purchaseCount} purchase(s)</span>
                                <span>Added {new Date(referral.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-xl font-bold text-[#5A0F1B]">+{referral.totalRewardEarned}</p>
                              <p className="text-[10px] text-gray-500">points earned</p>
                            </div>
                          </div>

                          {referral.purchases && referral.purchases.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#5A0F1B]/10">
                              <p className="text-[10px] font-semibold text-gray-700 mb-1.5">Purchase History:</p>
                              <div className="space-y-1">
                                {referral.purchases.map((purchase, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1.5 border border-gray-100">
                                    <span className="text-gray-700">Order ₹{purchase.orderAmount}</span>
                                    <span className="font-semibold text-green-600">+{purchase.rewardAmount} pts</span>
                                    <span className="text-gray-500 text-[10px]">{new Date(purchase.rewardedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaUsers className="text-4xl mx-auto mb-3 opacity-30 text-[#5A0F1B]" />
                    <p className="text-sm font-semibold text-gray-700">No referrals yet</p>
                    <p className="text-xs mt-1 mb-3">Start referring friends to earn rewards!</p>
                    <button
                      onClick={() => navigate('/refer-friend')}
                      className="px-4 py-2 bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] text-white rounded-lg hover:shadow-lg transition font-semibold text-sm inline-flex items-center gap-2"
                    >
                      <FaUserPlus /> Add Your First Friend
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
