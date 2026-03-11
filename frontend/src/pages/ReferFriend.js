import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUsers, FaGift, FaPhone, FaCheckCircle, FaArrowRight, FaSignInAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ReferFriend = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [friendForm, setFriendForm] = useState({
    name: '',
    whatsapp: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchReferralData();
    }
  }, [isAuthenticated]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/referral/my-referrals');
      setReferrals(data.referrals);
      setReferralStats(data.stats);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please login to refer friends');
      navigate('/login');
      return;
    }

    if (!friendForm.name.trim()) {
      toast.error('Please enter friend name');
      return;
    }

    if (!friendForm.whatsapp.trim()) {
      toast.error('Please enter WhatsApp number');
      return;
    }

    if (!/^[0-9]{10}$/.test(friendForm.whatsapp)) {
      toast.error('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    try {
      await API.post('/referral/add-friend', friendForm);
      toast.success('Friend added successfully!');
      setFriendForm({ name: '', whatsapp: '' });
      fetchReferralData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add friend');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-300', text: 'Pending', icon: FaClock },
      registered: { color: 'bg-blue-100 text-blue-800 border border-blue-300', text: 'Registered', icon: FaCheckCircle },
      active: { color: 'bg-green-100 text-green-800 border border-green-300', text: 'Active', icon: FaCheckCircle },
      completed: { color: 'bg-amber-100 text-amber-800 border border-amber-300', text: 'Completed', icon: FaCheckCircle }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {!isAuthenticated ? (
          /* Login Prompt Section - Compact */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-full mb-3">
                <FaUsers className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2d7d32] to-[#1a431c] bg-clip-text text-transparent mb-2">
                Refer & Earn Rewards
              </h1>
              <p className="text-gray-600">Share the elegance with friends and earn on every purchase!</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-[#2d7d32]/20 p-6 text-center mb-6">
              <div className="inline-block p-3 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-full mb-3">
                <FaSignInAlt className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Login to Start Referring</h2>
              <p className="text-gray-600 text-sm mb-4">Login to add friends and earn rewards</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#2d7d32] to-[#1a431c] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 mx-auto"
              >
                <FaSignInAlt /> Login Now
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2d7d32]/10 to-[#1a431c]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUserPlus className="text-2xl text-[#2d7d32]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Easy Referral</h3>
                <p className="text-xs text-gray-600">Name & WhatsApp only</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2d7d32]/10 to-[#1a431c]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaGift className="text-2xl text-[#2d7d32]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Earn Rewards</h3>
                <p className="text-xs text-gray-600">On every friend's purchase</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2d7d32]/10 to-[#1a431c]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaCheckCircle className="text-2xl text-[#2d7d32]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Track Progress</h3>
                <p className="text-xs text-gray-600">Real-time monitoring</p>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In User Section - Compact */
          <div className="max-w-6xl mx-auto">
            {/* Header & Form Combined */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Header & Form */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-lg">
                      <FaUserPlus className="text-xl text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Refer a Friend</h1>
                      <p className="text-sm text-gray-600">Add friends & earn rewards</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddFriend} className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Friend's Name *
                      </label>
                      <input
                        type="text"
                        value={friendForm.name}
                        onChange={(e) => setFriendForm({ ...friendForm, name: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7d32] focus:border-transparent transition text-sm"
                        placeholder="Enter friend's name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        WhatsApp Number *
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="tel"
                          value={friendForm.whatsapp}
                          onChange={(e) => setFriendForm({ ...friendForm, whatsapp: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7d32] focus:border-transparent transition text-sm"
                          placeholder="10-digit number"
                          maxLength="10"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-2.5 bg-gradient-to-r from-[#2d7d32] to-[#1a431c] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <FaUserPlus /> Add Referral
                    </button>
                  </form>
                </div>

                {/* Right: How to Earn & Statistics */}
                <div>
                  {/* How to Earn Referral Points */}
                  <div className="bg-gradient-to-r from-[#2d7d32]/5 to-[#1a431c]/5 border-2 border-[#2d7d32]/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <FaInfoCircle className="text-[#2d7d32] text-sm mt-0.5 flex-shrink-0" />
                      <h4 className="font-bold text-gray-900 text-sm">How to Earn Referral Points:</h4>
                    </div>
                    <div className="space-y-2 text-xs text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="bg-[#2d7d32] text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                        <span><strong>Add Your Friend:</strong> Enter their name and WhatsApp number using the form</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-[#2d7d32] text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                        <span><strong>Friend Registers:</strong> When they sign up using the same WhatsApp number, referral is linked</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-[#2d7d32] text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                        <span><strong>Friend Purchases:</strong> Every time your friend makes a purchase, you earn points!</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaGift className="text-green-600 mt-0.5 flex-shrink-0 text-sm" />
                        <span><strong>Unlimited Earnings:</strong> Earn rewards on every purchase your friend makes</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#2d7d32]/20">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        💡 <strong>Point Value:</strong> 1 Point = ₹1 • Use points at checkout for discounts
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">Your Statistics</h3>
                  {referralStats && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-[#2d7d32]/5 to-[#1a431c]/5 rounded-lg p-3 text-center border border-[#2d7d32]/20">
                        <p className="text-2xl font-bold text-[#2d7d32]">{referralStats.totalReferrals}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Total Referrals</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                        <p className="text-2xl font-bold text-yellow-700">{referralStats.pendingReferrals}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Pending</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                        <p className="text-2xl font-bold text-green-700">{referralStats.activeReferrals}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Active</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 text-center border border-amber-200">
                        <p className="text-2xl font-bold text-[#2d7d32]">{referralStats.totalRewardsEarned}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Points Earned</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/wallet')}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-semibold text-sm flex items-center justify-center gap-2 border border-gray-300"
                  >
                    View Full Wallet <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            {/* Referrals List - Compact */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#2d7d32] to-[#1a431c] px-5 py-3">
                <h3 className="text-lg font-bold text-white">Your Referrals</h3>
              </div>
              <div className="p-5 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2d7d32]"></div>
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaUsers className="text-4xl mx-auto mb-2 opacity-30 text-[#2d7d32]" />
                    <p className="text-sm font-semibold text-gray-700">No referrals yet</p>
                    <p className="text-xs mt-1">Add your first friend above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg p-3 border border-[#2d7d32]/10 hover:border-[#2d7d32]/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-bold text-gray-900 truncate">{referral.friendName}</h4>
                              {getStatusBadge(referral.status)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                              <FaPhone className="text-[10px] text-green-600" />
                              <span>{referral.whatsapp}</span>
                            </div>
                            {referral.registeredUser && (
                              <p className="text-xs text-blue-600">
                                ✓ {referral.registeredUser.name}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{referral.purchaseCount} purchase(s)</span>
                              <span>{new Date(referral.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <p className="text-xl font-bold text-[#2d7d32]">+{referral.totalRewardEarned}</p>
                            <p className="text-[10px] text-gray-500">points</p>
                          </div>
                        </div>

                        {referral.purchases && referral.purchases.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#2d7d32]/10">
                            <p className="text-[10px] font-semibold text-gray-700 mb-1.5">Purchase History:</p>
                            <div className="space-y-1">
                              {referral.purchases.map((purchase, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1.5 border border-gray-100">
                                  <span className="text-gray-700">₹{purchase.orderAmount}</span>
                                  <span className="font-semibold text-green-600">+{purchase.rewardAmount}</span>
                                  <span className="text-gray-500 text-[10px]">{new Date(purchase.rewardedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferFriend;
