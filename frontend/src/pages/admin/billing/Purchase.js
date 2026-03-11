import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaEdit, FaFileInvoice, FaClipboardList, FaTimes, FaTrash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../../components/AdminLayout';
import API from '../../../utils/api';

const Purchase = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('order'); // 'order' or 'invoice'
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    supplier: '',
    expectedDeliveryDate: '',
    isInterState: false,
    items: [],
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    rawMaterial: '',
    quantity: 1,
    rate: 0,
    discount: 0,
    discountType: 'percentage',
    gstRate: 5
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, invoicesRes, suppliersRes, materialsRes] = await Promise.all([
        API.get('/billing/purchase/orders'),
        API.get('/billing/purchase/invoices'),
        API.get('/billing/suppliers'),
        API.get('/billing/raw-materials')
      ]);

      setPurchaseOrders(ordersRes.data.purchaseOrders || []);
      setPurchaseInvoices(invoicesRes.data.purchaseInvoices || []);
      setSuppliers(suppliersRes.data.suppliers || []);
      setRawMaterials(materialsRes.data.rawMaterials || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (materialId) => {
    const material = rawMaterials.find(m => m._id === materialId);
    if (material) {
      setCurrentItem({
        ...currentItem,
        rawMaterial: materialId,
        rate: material.costPrice,
        gstRate: material.gstRate
      });
    }
  };

  const addItem = () => {
    if (!currentItem.rawMaterial) {
      toast.error('Please select a raw material');
      return;
    }

    const material = rawMaterials.find(m => m._id === currentItem.rawMaterial);
    if (!material) return;

    const existingIndex = formData.items.findIndex(item => item.rawMaterial === currentItem.rawMaterial);
    if (existingIndex >= 0) {
      toast.error('Material already added. Edit quantity instead.');
      return;
    }

    const quantity = parseFloat(currentItem.quantity) || 0;
    const rate = parseFloat(currentItem.rate) || 0;
    const discount = parseFloat(currentItem.discount) || 0;
    const gstRate = parseFloat(currentItem.gstRate) || 0;

    let grossAmount = quantity * rate;
    let discountAmount = currentItem.discountType === 'percentage'
      ? (grossAmount * discount) / 100
      : discount;
    let taxableAmount = grossAmount - discountAmount;
    let gstAmount = (taxableAmount * gstRate) / 100;

    const newItem = {
      rawMaterial: material._id,
      name: material.name,
      code: material.code,
      quantity,
      unit: material.unit,
      rate,
      discount,
      discountType: currentItem.discountType,
      gstRate,
      taxableAmount,
      cgst: formData.isInterState ? 0 : gstAmount / 2,
      sgst: formData.isInterState ? 0 : gstAmount / 2,
      igst: formData.isInterState ? gstAmount : 0,
      amount: taxableAmount + gstAmount
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    setCurrentItem({
      rawMaterial: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      gstRate: 5
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalCGST = formData.items.reduce((sum, item) => sum + (item.cgst || 0), 0);
    const totalSGST = formData.items.reduce((sum, item) => sum + (item.sgst || 0), 0);
    const totalIGST = formData.items.reduce((sum, item) => sum + (item.igst || 0), 0);
    const totalGST = totalCGST + totalSGST + totalIGST;
    const grandTotal = subtotal + totalGST;

    return { subtotal, totalCGST, totalSGST, totalIGST, totalGST, grandTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (!formData.supplier) {
      toast.error('Please select a supplier');
      return;
    }

    try {
      const totals = calculateTotals();

      const submitData = {
        supplier: formData.supplier,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        isInterState: formData.isInterState,
        items: formData.items,
        subtotal: totals.subtotal,
        cgst: totals.totalCGST,
        sgst: totals.totalSGST,
        igst: totals.totalIGST,
        totalGst: totals.totalGST,
        totalAmount: Math.round(totals.grandTotal),
        notes: formData.notes
      };

      if (modalType === 'order') {
        await API.post('/billing/purchase/orders', submitData);
        toast.success('Purchase order created successfully');
      } else {
        await API.post('/billing/purchase/invoices', submitData);
        toast.success('Purchase invoice created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier: '',
      expectedDeliveryDate: '',
      isInterState: false,
      items: [],
      notes: ''
    });
    setCurrentItem({
      rawMaterial: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      gstRate: 5
    });
  };

  const totals = calculateTotals();

  const filteredOrders = purchaseOrders.filter(po =>
    po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = purchaseInvoices.filter(pi =>
    pi.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pi.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Purchase Management</h2>
            <p className="text-gray-600 mt-1">Manage purchase orders and invoices</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { resetForm(); setModalType('order'); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaPlus /> New PO
            </button>
            <button
              onClick={() => { resetForm(); setModalType('invoice'); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#f77c1c] text-white rounded-lg hover:bg-amber-700 transition"
            >
              <FaPlus /> New Invoice
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'orders'
                ? 'text-[#f77c1c] border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaClipboardList className="inline mr-2" />
            Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'invoices'
                ? 'text-[#f77c1c] border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaFileInvoice className="inline mr-2" />
            Purchase Invoices ({purchaseInvoices.length})
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : activeTab === 'orders' ? (
          // Purchase Orders Table
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((po) => (
                      <tr key={po._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{po.poNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{po.supplier?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          ₹{po.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            po.status === 'Fully Received' ? 'bg-green-100 text-green-800' :
                            po.status === 'Partially Received' ? 'bg-yellow-100 text-yellow-800' :
                            po.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                            po.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                              <FaEye />
                            </button>
                            {po.status === 'Draft' && (
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Create Invoice">
                                <FaFileInvoice />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Purchase Orders</h3>
                <p className="text-gray-600">Create your first purchase order</p>
              </div>
            )}
          </div>
        ) : (
          // Purchase Invoices Table
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GRN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.map((pi) => (
                      <tr key={pi._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{pi.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{pi.supplier?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(pi.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800">₹{pi.totalAmount?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Due: ₹{pi.balanceAmount?.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pi.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                            pi.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {pi.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {pi.grnGenerated ? (
                            <span className="text-green-600"><FaCheck /></span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FaFileInvoice className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Purchase Invoices</h3>
                <p className="text-gray-600">Create your first purchase invoice</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {modalType === 'order' ? 'New Purchase Order' : 'New Purchase Invoice'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Supplier Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isInterState}
                      onChange={(e) => setFormData({ ...formData, isInterState: e.target.checked })}
                      className="rounded text-[#f77c1c]"
                    />
                    <span className="text-sm">Inter-State Purchase (IGST)</span>
                  </label>
                </div>
              </div>

              {/* Add Item */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Add Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material</label>
                    <select
                      value={currentItem.rawMaterial}
                      onChange={(e) => handleMaterialChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Material</option>
                      {rawMaterials.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                    <input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="number"
                      value={currentItem.rate}
                      onChange={(e) => setCurrentItem({ ...currentItem, rate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                    <select
                      value={currentItem.gstRate}
                      onChange={(e) => setCurrentItem({ ...currentItem, gstRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      {[0, 5, 12, 18, 28].map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Items Table */}
              {formData.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Material</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Taxable</th>
                        <th className="px-3 py-2 text-right">GST</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                          <td className="px-3 py-2 text-right">₹{item.rate}</td>
                          <td className="px-3 py-2 text-right">₹{item.taxableAmount?.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">
                            ₹{(formData.isInterState ? item.igst : item.cgst + item.sgst)?.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">₹{item.amount?.toFixed(2)}</td>
                          <td className="px-3 py-2">
                            <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              {formData.items.length > 0 && (
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>₹{totals.totalGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{Math.round(totals.grandTotal).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={formData.items.length === 0}
                  className="flex-1 px-4 py-3 bg-[#f77c1c] text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:bg-gray-400"
                >
                  {modalType === 'order' ? 'Create Purchase Order' : 'Create Purchase Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
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

export default Purchase;
