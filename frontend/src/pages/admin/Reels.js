import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaToggleOn, FaToggleOff, FaInstagram } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    instagramUrl: '',
    thumbnailUrl: '',
    product: '',
    order: 0,
    isActive: true
  });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchReels();
    fetchProducts();
  }, []);

  const fetchReels = async () => {
    try {
      const { data } = await API.get('/reels');
      setReels(data.reels || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error('Failed to fetch reels');
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.instagramUrl) {
      toast.error('Instagram URL is required');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        instagramUrl: formData.instagramUrl,
        thumbnailUrl: formData.thumbnailUrl,
        product: formData.product || null,
        order: formData.order,
        isActive: formData.isActive
      };

      if (editingReel) {
        await API.put(`/reels/${editingReel._id}`, payload);
        toast.success('Reel updated successfully');
      } else {
        await API.post('/reels', payload);
        toast.success('Reel created successfully');
      }

      fetchReels();
      closeModal();
    } catch (error) {
      console.error('Error saving reel:', error);
      toast.error(error.response?.data?.message || 'Failed to save reel');
    }
  };

  const handleEdit = (reel) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title || '',
      instagramUrl: reel.instagramUrl,
      thumbnailUrl: reel.thumbnailUrl || '',
      product: reel.product?._id || reel.product || '',
      order: reel.order,
      isActive: reel.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reel?')) {
      try {
        await API.delete(`/reels/${id}`);
        toast.success('Reel deleted successfully');
        fetchReels();
      } catch (error) {
        console.error('Error deleting reel:', error);
        toast.error('Failed to delete reel');
      }
    }
  };

  const handleToggleStatus = async (reel) => {
    try {
      await API.put(`/reels/${reel._id}/toggle`);
      toast.success(`Reel ${reel.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchReels();
    } catch (error) {
      console.error('Error toggling reel status:', error);
      toast.error('Failed to toggle reel status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReel(null);
    setFormData({
      title: '',
      instagramUrl: '',
      thumbnailUrl: '',
      product: '',
      order: 0,
      isActive: true
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;

    if (draggedItem !== index) {
      const newReels = [...reels];
      const draggedReel = newReels[draggedItem];
      newReels.splice(draggedItem, 1);
      newReels.splice(index, 0, draggedReel);
      setReels(newReels);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    try {
      await API.put('/reels/order', {
        reels: reels.map((reel, index) => ({ id: reel._id, order: index }))
      });
      toast.success('Reel order updated');
    } catch (error) {
      console.error('Error updating reel order:', error);
      toast.error('Failed to update order');
      fetchReels(); // Revert on error
    }

    setDraggedItem(null);
  };

  // Extract Instagram reel ID from URL for thumbnail
  // const getInstagramEmbedUrl = (url) => {
  //   if (!url) return '';
  //   // Convert Instagram reel URL to embed format
  //   const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  //   if (match) {
  //     return `https://www.instagram.com/reel/${match[1]}/embed`;
  //   }
  //   return url;
  // };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reels Management</h1>
          <p className="text-gray-600 mt-1">Manage Instagram reels displayed on the homepage</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg"
        >
          <FaPlus /> Add New Reel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5A0F1B]"></div>
        </div>
      ) : reels.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaInstagram className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Reels Added</h3>
          <p className="text-gray-500 mb-4">Add Instagram reels to showcase on your homepage</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white px-6 py-2 rounded-lg"
          >
            Add Your First Reel
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              <FaGripVertical className="inline mr-2" />
              Drag and drop to reorder reels
            </p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reels.map((reel, index) => (
                <tr
                  key={reel._id}
                  className={`hover:bg-gray-50 ${draggedItem === index ? 'bg-blue-50' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <td className="px-4 py-4 cursor-move">
                    <FaGripVertical className="text-gray-400" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {reel.thumbnailUrl ? (
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title || 'Reel thumbnail'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaInstagram className="text-2xl text-pink-500" />
                        )}
                      </div>
                      <a
                        href={reel.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 text-sm truncate max-w-[200px]"
                        title={reel.instagramUrl}
                      >
                        {reel.instagramUrl}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{reel.title || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {reel.product?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reel.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(reel)}
                      className={`flex items-center gap-2 ${reel.isActive ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {reel.isActive ? (
                        <>
                          <FaToggleOn className="text-2xl" />
                          <span className="text-xs">Active</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="text-2xl" />
                          <span className="text-xs">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(reel)}
                      className="text-[#5A0F1B] hover:text-[#7A1525] mr-3"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(reel._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaInstagram className="text-2xl text-pink-500" />
                <h2 className="text-2xl font-bold">
                  {editingReel ? 'Edit Reel' : 'Add New Reel'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram Reel URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                    required
                    placeholder="https://www.instagram.com/reel/ABC123..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the Instagram reel URL (e.g., https://www.instagram.com/reel/ABC123/)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Reel title or description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Custom thumbnail image URL (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link to Product (Optional)</label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  >
                    <option value="">No product linked</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Optionally link this reel to a product for easy navigation
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                    />
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#5A0F1B] focus:ring-[#5A0F1B] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active (visible on homepage)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white rounded-md"
                  >
                    {editingReel ? 'Update Reel' : 'Add Reel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;
