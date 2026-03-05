import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaPlay, FaCheck, FaTimes, FaTrash, FaIndustry, FaClipboardList } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../../components/AdminLayout';
import API from '../../../utils/api';

const Production = () => {
  const [activeTab, setActiveTab] = useState('production');
  const [productionOrders, setProductionOrders] = useState([]);
  const [boms, setBOMs] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [productionForm, setProductionForm] = useState({
    product: '',
    bom: '',
    plannedQuantity: 1,
    expectedCompletionDate: '',
    notes: ''
  });

  const [bomForm, setBOMForm] = useState({
    product: '',
    items: [],
    laborCost: 0,
    overheadCost: 0,
    notes: ''
  });

  const [bomItem, setBOMItem] = useState({
    rawMaterial: '',
    requiredQuantity: 0,
    wastagePercentage: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, bomRes, productsRes, materialsRes] = await Promise.all([
        API.get('/billing/production'),
        API.get('/billing/bom'),
        API.get('/products?limit=1000'),
        API.get('/billing/raw-materials')
      ]);

      setProductionOrders(prodRes.data.productionOrders || []);
      setBOMs(bomRes.data.boms || []);
      setProducts(productsRes.data.products || []);
      setRawMaterials(materialsRes.data.rawMaterials || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId) => {
    setProductionForm({ ...productionForm, product: productId, bom: '' });
  };

  const getAvailableBOMs = () => {
    return boms.filter(bom => bom.product?._id === productionForm.product && bom.isActive);
  };

  const addBOMItem = () => {
    if (!bomItem.rawMaterial || bomItem.requiredQuantity <= 0) {
      toast.error('Please select material and enter quantity');
      return;
    }

    const material = rawMaterials.find(m => m._id === bomItem.rawMaterial);
    if (!material) return;

    const existingIndex = bomForm.items.findIndex(item => item.rawMaterial === bomItem.rawMaterial);
    if (existingIndex >= 0) {
      toast.error('Material already added');
      return;
    }

    const effectiveQty = bomItem.requiredQuantity * (1 + bomItem.wastagePercentage / 100);

    setBOMForm({
      ...bomForm,
      items: [...bomForm.items, {
        rawMaterial: material._id,
        name: material.name,
        requiredQuantity: bomItem.requiredQuantity,
        unit: material.unit,
        wastagePercentage: bomItem.wastagePercentage,
        effectiveQuantity: effectiveQty,
        costPerUnit: material.costPrice
      }]
    });

    setBOMItem({ rawMaterial: '', requiredQuantity: 0, wastagePercentage: 0 });
  };

  const removeBOMItem = (index) => {
    setBOMForm({
      ...bomForm,
      items: bomForm.items.filter((_, i) => i !== index)
    });
  };

  const calculateBOMCost = () => {
    const materialCost = bomForm.items.reduce((sum, item) =>
      sum + (item.effectiveQuantity * item.costPerUnit), 0
    );
    return materialCost + parseFloat(bomForm.laborCost || 0) + parseFloat(bomForm.overheadCost || 0);
  };

  const handleProductionSubmit = async (e) => {
    e.preventDefault();

    if (!productionForm.product || !productionForm.bom) {
      toast.error('Please select product and BOM');
      return;
    }

    try {
      await API.post('/billing/production', productionForm);
      toast.success('Production order created successfully');
      setShowModal(false);
      setProductionForm({ product: '', bom: '', plannedQuantity: 1, expectedCompletionDate: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create production order');
    }
  };

  const handleBOMSubmit = async (e) => {
    e.preventDefault();

    if (!bomForm.product || bomForm.items.length === 0) {
      toast.error('Please select product and add at least one material');
      return;
    }

    try {
      await API.post('/billing/bom', {
        product: bomForm.product,
        items: bomForm.items,
        laborCost: bomForm.laborCost,
        overheadCost: bomForm.overheadCost,
        notes: bomForm.notes
      });
      toast.success('BOM created successfully');
      setShowBOMModal(false);
      setBOMForm({ product: '', items: [], laborCost: 0, overheadCost: 0, notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create BOM');
    }
  };

  const startProduction = async (id) => {
    if (!window.confirm('Start this production? Materials will be checked for availability.')) return;
    try {
      await API.put(`/billing/production/${id}/start`);
      toast.success('Production started');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start production');
    }
  };

  const completeProduction = async (id, plannedQty) => {
    const completedQty = window.prompt('Enter completed quantity:', plannedQty);
    if (!completedQty) return;

    try {
      await API.put(`/billing/production/${id}/complete`, {
        completedQuantity: parseInt(completedQty),
        rejectedQuantity: 0
      });
      toast.success('Production completed. Stock updated.');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete production');
    }
  };

  const filteredProduction = productionOrders.filter(po =>
    po.productionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBOMs = boms.filter(bom =>
    bom.bomCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Production Management</h2>
            <p className="text-gray-600 mt-1">Manage BOMs and production orders</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBOMModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaPlus /> New BOM
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              <FaPlus /> New Production
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('production')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'production'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaIndustry className="inline mr-2" />
            Production Orders ({productionOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'bom'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaClipboardList className="inline mr-2" />
            Bill of Materials ({boms.length})
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
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
        ) : activeTab === 'production' ? (
          // Production Orders
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredProduction.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProduction.map((po) => (
                      <tr key={po._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{po.productionNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{po.productName}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-medium">{po.completedQuantity || 0}</span>
                          <span className="text-gray-500">/{po.plannedQuantity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            po.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            po.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            po.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                            po.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(po.completedQuantity / po.plannedQuantity) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                              <FaEye />
                            </button>
                            {(po.status === 'Draft' || po.status === 'Planned') && (
                              <button
                                onClick={() => startProduction(po._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Start Production"
                              >
                                <FaPlay />
                              </button>
                            )}
                            {po.status === 'In Progress' && (
                              <button
                                onClick={() => completeProduction(po._id, po.plannedQuantity)}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Complete Production"
                              >
                                <FaCheck />
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
                <FaIndustry className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Production Orders</h3>
                <p className="text-gray-600">Create your first production order</p>
              </div>
            )}
          </div>
        ) : (
          // BOMs
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredBOMs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BOM Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBOMs.map((bom) => (
                      <tr key={bom._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{bom.bomCode}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{bom.product?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{bom.items?.length || 0} items</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          ₹{bom.totalCost?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bom.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {bom.isActive ? 'Active' : 'Inactive'}
                          </span>
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
            ) : (
              <div className="p-12 text-center">
                <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Bill of Materials</h3>
                <p className="text-gray-600">Create your first BOM to start production</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Production Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">New Production Order</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleProductionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select
                  value={productionForm.product}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BOM *</label>
                <select
                  value={productionForm.bom}
                  onChange={(e) => setProductionForm({ ...productionForm, bom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                  disabled={!productionForm.product}
                >
                  <option value="">Select BOM</option>
                  {getAvailableBOMs().map(bom => (
                    <option key={bom._id} value={bom._id}>{bom.bomCode} (Cost: ₹{bom.totalCost})</option>
                  ))}
                </select>
                {productionForm.product && getAvailableBOMs().length === 0 && (
                  <p className="text-sm text-red-500 mt-1">No BOM available for this product. Create one first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Produce *</label>
                <input
                  type="number"
                  value={productionForm.plannedQuantity}
                  onChange={(e) => setProductionForm({ ...productionForm, plannedQuantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion Date</label>
                <input
                  type="date"
                  value={productionForm.expectedCompletionDate}
                  onChange={(e) => setProductionForm({ ...productionForm, expectedCompletionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium">
                  Create Production Order
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM Modal */}
      {showBOMModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Create Bill of Materials</h3>
              <button onClick={() => setShowBOMModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleBOMSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select
                  value={bomForm.product}
                  onChange={(e) => setBOMForm({ ...bomForm, product: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Add Material */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Add Materials</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material</label>
                    <select
                      value={bomItem.rawMaterial}
                      onChange={(e) => setBOMItem({ ...bomItem, rawMaterial: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Material</option>
                      {rawMaterials.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={bomItem.requiredQuantity}
                      onChange={(e) => setBOMItem({ ...bomItem, requiredQuantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wastage %</label>
                    <input
                      type="number"
                      value={bomItem.wastagePercentage}
                      onChange={(e) => setBOMItem({ ...bomItem, wastagePercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <button type="button" onClick={addBOMItem} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    Add
                  </button>
                </div>
              </div>

              {/* Materials List */}
              {bomForm.items.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Material</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Wastage</th>
                      <th className="px-3 py-2 text-right">Effective Qty</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomForm.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">{item.requiredQuantity} {item.unit}</td>
                        <td className="px-3 py-2 text-right">{item.wastagePercentage}%</td>
                        <td className="px-3 py-2 text-right">{item.effectiveQuantity.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">₹{(item.effectiveQuantity * item.costPerUnit).toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <button type="button" onClick={() => removeBOMItem(index)} className="text-red-600">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
                  <input
                    type="number"
                    value={bomForm.laborCost}
                    onChange={(e) => setBOMForm({ ...bomForm, laborCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overhead Cost</label>
                  <input
                    type="number"
                    value={bomForm.overheadCost}
                    onChange={(e) => setBOMForm({ ...bomForm, overheadCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    min="0"
                  />
                </div>
              </div>

              {bomForm.items.length > 0 && (
                <div className="text-right font-bold text-lg">
                  Total BOM Cost: ₹{calculateBOMCost().toFixed(2)}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t">
                <button type="submit" disabled={bomForm.items.length === 0} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-400">
                  Create BOM
                </button>
                <button type="button" onClick={() => setShowBOMModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">
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

export default Production;
