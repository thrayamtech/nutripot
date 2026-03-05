import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaPrint, FaFileInvoiceDollar, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../../components/AdminLayout';
import API from '../../../utils/api';

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerCity: '',
    customerState: 'Tamil Nadu',
    customerPincode: '',
    customerGstNumber: '',
    placeOfSupply: 'Tamil Nadu',
    isInterState: false,
    paymentMode: 'Cash',
    items: [],
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: 1,
    rate: 0,
    discount: 0,
    discountType: 'percentage',
    gstRate: 5
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Credit'];
  const gstRates = [0, 5, 12, 18, 28];

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/billing/sales/invoices');
      setInvoices(data.salesInvoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products?limit=1000');
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handlePlaceOfSupplyChange = (state) => {
    const isInterState = state !== 'Tamil Nadu'; // Assuming business is in Tamil Nadu
    setFormData({ ...formData, placeOfSupply: state, isInterState });
  };

  const addItem = () => {
    if (!currentItem.product) {
      toast.error('Please select a product');
      return;
    }

    const product = products.find(p => p._id === currentItem.product);
    if (!product) return;

    if (currentItem.quantity > product.stock) {
      toast.error(`Only ${product.stock} units available in stock`);
      return;
    }

    const existingIndex = formData.items.findIndex(item => item.product === currentItem.product);
    if (existingIndex >= 0) {
      toast.error('Product already added. Edit quantity instead.');
      return;
    }

    // Calculate item totals
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
      product: product._id,
      name: product.name,
      quantity,
      unit: 'pieces',
      mrp: product.price,
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
      product: '',
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

    try {
      const totals = calculateTotals();

      const submitData = {
        customerDetails: {
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail,
          address: {
            addressLine1: formData.customerAddress,
            city: formData.customerCity,
            state: formData.customerState,
            pincode: formData.customerPincode
          },
          gstNumber: formData.customerGstNumber
        },
        placeOfSupply: formData.placeOfSupply,
        isInterState: formData.isInterState,
        items: formData.items,
        subtotal: totals.subtotal,
        cgst: totals.totalCGST,
        sgst: totals.totalSGST,
        igst: totals.totalIGST,
        totalGst: totals.totalGST,
        totalAmount: Math.round(totals.grandTotal),
        paymentMode: formData.paymentMode,
        paidAmount: formData.paymentMode === 'Credit' ? 0 : Math.round(totals.grandTotal),
        notes: formData.notes
      };

      await API.post('/billing/sales/invoices', submitData);
      toast.success('Sales invoice created successfully');
      setShowModal(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      customerCity: '',
      customerState: 'Tamil Nadu',
      customerPincode: '',
      customerGstNumber: '',
      placeOfSupply: 'Tamil Nadu',
      isInterState: false,
      paymentMode: 'Cash',
      items: [],
      notes: ''
    });
    setCurrentItem({
      product: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      gstRate: 5
    });
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setCurrentItem({
        ...currentItem,
        product: productId,
        rate: product.discountPrice || product.price
      });
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || invoice.status === filterStatus;
    const matchesPayment = !filterPaymentStatus || invoice.paymentStatus === filterPaymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totals = calculateTotals();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sales Invoices</h2>
            <p className="text-gray-600 mt-1">Manage your sales and billing</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            <FaPlus /> New Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{invoice.items?.length || 0} items</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">{invoice.customerDetails?.name || 'Walk-in'}</p>
                        <p className="text-xs text-gray-500">{invoice.customerDetails?.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">₹{invoice.totalAmount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">GST: ₹{invoice.totalGst?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                          invoice.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingInvoice(invoice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            title="Print"
                          >
                            <FaPrint />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaFileInvoiceDollar className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Invoices Found</h3>
            <p className="text-gray-600 mb-6">Start by creating your first sales invoice</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Create First Invoice
            </button>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">New Sales Invoice</h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Customer Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Customer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of Supply *</label>
                    <select
                      value={formData.placeOfSupply}
                      onChange={(e) => handlePlaceOfSupplyChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      required
                    >
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={formData.customerGstNumber}
                      onChange={(e) => setFormData({ ...formData, customerGstNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                    <select
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      {paymentModes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>
                  {formData.isInterState && (
                    <div className="flex items-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Inter-State Sale (IGST applicable)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Item */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Add Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={currentItem.product}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Product</option>
                      {products.filter(p => p.stock > 0).map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} (Stock: {product.stock})
                        </option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disc %</label>
                    <input
                      type="number"
                      value={currentItem.discount}
                      onChange={(e) => setCurrentItem({ ...currentItem, discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                    <select
                      value={currentItem.gstRate}
                      onChange={(e) => setCurrentItem({ ...currentItem, gstRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      {gstRates.map(rate => (
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
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Disc</th>
                        <th className="px-3 py-2 text-right">Taxable</th>
                        <th className="px-3 py-2 text-right">{formData.isInterState ? 'IGST' : 'CGST'}</th>
                        {!formData.isInterState && <th className="px-3 py-2 text-right">SGST</th>}
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">₹{item.rate}</td>
                          <td className="px-3 py-2 text-right">{item.discount}%</td>
                          <td className="px-3 py-2 text-right">₹{item.taxableAmount?.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">
                            ₹{formData.isInterState ? item.igst?.toFixed(2) : item.cgst?.toFixed(2)}
                          </td>
                          {!formData.isInterState && (
                            <td className="px-3 py-2 text-right">₹{item.sgst?.toFixed(2)}</td>
                          )}
                          <td className="px-3 py-2 text-right font-medium">₹{item.amount?.toFixed(2)}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
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
                  <div className="w-72 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    {formData.isInterState ? (
                      <div className="flex justify-between">
                        <span>IGST:</span>
                        <span>₹{totals.totalIGST.toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>CGST:</span>
                          <span>₹{totals.totalCGST.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST:</span>
                          <span>₹{totals.totalSGST.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span>₹{Math.round(totals.grandTotal).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={formData.items.length === 0}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:bg-gray-400"
                >
                  Create Invoice
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

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Invoice: {viewingInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setViewingInvoice(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{viewingInvoice.customerDetails?.name || 'Walk-in'}</p>
                  {viewingInvoice.customerDetails?.phone && (
                    <p className="text-sm">{viewingInvoice.customerDetails.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.invoiceDate).toLocaleDateString()}</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">₹{item.rate}</td>
                      <td className="px-3 py-2 text-right">₹{item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{viewingInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span>₹{viewingInvoice.totalGst?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{viewingInvoice.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SalesInvoices;
