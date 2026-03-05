import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaTimes, FaMoneyBillWave, FaReceipt, FaFileAlt, FaWallet } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../../components/AdminLayout';
import API from '../../../utils/api';

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [voucherType, setVoucherType] = useState('Payment');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    voucherType: 'Payment',
    supplier: '',
    partyName: '',
    amount: 0,
    paymentMode: 'Cash',
    bankName: '',
    chequeNumber: '',
    transactionId: '',
    expenseCategory: '',
    narration: ''
  });

  const paymentModes = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'];
  const expenseCategories = ['Rent', 'Utilities', 'Salary', 'Transportation', 'Maintenance', 'Office Supplies', 'Marketing', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vouchersRes, suppliersRes] = await Promise.all([
        API.get('/billing/vouchers'),
        API.get('/billing/suppliers')
      ]);

      setVouchers(vouchersRes.data.vouchers || []);
      setSuppliers(suppliersRes.data.suppliers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const submitData = {
        voucherType: formData.voucherType,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        narration: formData.narration,
        bankDetails: {
          bankName: formData.bankName,
          chequeNumber: formData.chequeNumber,
          transactionId: formData.transactionId
        }
      };

      if (formData.voucherType === 'Payment') {
        submitData.supplier = formData.supplier;
      } else if (formData.voucherType === 'Expense') {
        submitData.expenseCategory = formData.expenseCategory;
        submitData.partyName = formData.partyName;
      } else {
        submitData.partyName = formData.partyName;
      }

      await API.post('/billing/vouchers', submitData);
      toast.success(`${formData.voucherType} voucher created successfully`);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create voucher');
    }
  };

  const resetForm = () => {
    setFormData({
      voucherType: voucherType,
      supplier: '',
      partyName: '',
      amount: 0,
      paymentMode: 'Cash',
      bankName: '',
      chequeNumber: '',
      transactionId: '',
      expenseCategory: '',
      narration: ''
    });
  };

  const openModal = (type) => {
    setVoucherType(type);
    setFormData({ ...formData, voucherType: type });
    setShowModal(true);
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || v.voucherType === filterType;
    return matchesSearch && matchesType;
  });

  const getVoucherIcon = (type) => {
    switch (type) {
      case 'Payment': return <FaMoneyBillWave className="text-red-600" />;
      case 'Receipt': return <FaReceipt className="text-green-600" />;
      case 'Expense': return <FaWallet className="text-orange-600" />;
      default: return <FaFileAlt className="text-blue-600" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Vouchers</h2>
            <p className="text-gray-600 mt-1">Manage payment, receipt and expense vouchers</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openModal('Payment')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <FaMoneyBillWave /> Payment
            </button>
            <button
              onClick={() => openModal('Receipt')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaReceipt /> Receipt
            </button>
            <button
              onClick={() => openModal('Expense')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <FaWallet /> Expense
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by voucher number or party..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="">All Types</option>
              <option value="Payment">Payment</option>
              <option value="Receipt">Receipt</option>
              <option value="Expense">Expense</option>
              <option value="Journal">Journal</option>
            </select>
          </div>
        </div>

        {/* Vouchers List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredVouchers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVouchers.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{v.voucherNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getVoucherIcon(v.voucherType)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            v.voucherType === 'Payment' ? 'bg-red-100 text-red-800' :
                            v.voucherType === 'Receipt' ? 'bg-green-100 text-green-800' :
                            v.voucherType === 'Expense' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {v.voucherType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {v.supplier?.name || v.partyName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(v.voucherDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        ₹{v.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {v.paymentMode}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Vouchers Found</h3>
            <p className="text-gray-600">Create your first voucher</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {voucherType} Voucher
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {voucherType === 'Payment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} (Balance: ₹{s.currentBalance?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {voucherType === 'Expense' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category *</label>
                    <select
                      value={formData.expenseCategory}
                      onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid To</label>
                    <input
                      type="text"
                      value={formData.partyName}
                      onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="Name of person/vendor"
                    />
                  </div>
                </>
              )}

              {voucherType === 'Receipt' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received From *</label>
                  <input
                    type="text"
                    value={formData.partyName}
                    onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                    placeholder="Customer/Party name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                  min="1"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                >
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              {(formData.paymentMode === 'Bank Transfer' || formData.paymentMode === 'Cheque') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.paymentMode === 'Cheque' ? 'Cheque No' : 'Transaction ID'}
                    </label>
                    <input
                      type="text"
                      value={formData.paymentMode === 'Cheque' ? formData.chequeNumber : formData.transactionId}
                      onChange={(e) => setFormData({
                        ...formData,
                        [formData.paymentMode === 'Cheque' ? 'chequeNumber' : 'transactionId']: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Narration *</label>
                <textarea
                  value={formData.narration}
                  onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                  placeholder="Description of this transaction..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium ${
                    voucherType === 'Payment' ? 'bg-red-600 hover:bg-red-700' :
                    voucherType === 'Receipt' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Create {voucherType} Voucher
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Vouchers;
