import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaPlay, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    videoUrl: '',
    product: '',
    isActive: true
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file must be less than 100MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const { data } = await API.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setFormData(prev => ({ ...prev, videoUrl: data.url }));
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.videoUrl) {
      toast.error('Please upload a video');
      return;
    }

    if (!formData.product) {
      toast.error('Please select a product');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        videoUrl: formData.videoUrl,
        product: formData.product,
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
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reel) => {
    setEditingReel(reel);
    setFormData({
      videoUrl: reel.videoUrl || '',
      product: reel.product?._id || reel.product || '',
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
      videoUrl: '',
      product: '',
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
      fetchReels();
    }

    setDraggedItem(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reels Management</h1>
          <p className="text-gray-600 mt-1">Upload videos to display on the homepage</p>
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
          <FaPlay className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Reels Added</h3>
          <p className="text-gray-500 mb-4">Upload videos to showcase on your homepage</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white px-6 py-2 rounded-lg"
          >
            Add Your First Reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {reels.map((reel, index) => (
            <div
              key={reel._id}
              className={`bg-white rounded-xl shadow-md overflow-hidden group ${draggedItem === index ? 'ring-2 ring-blue-500' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Video Preview */}
              <div className="relative aspect-[9/16] bg-black">
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEdit(reel)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(reel._id)}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Drag Handle */}
                <div className="absolute top-2 left-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaGripVertical className="text-white text-lg drop-shadow-lg" />
                </div>

                {/* Status Badge */}
                <button
                  onClick={() => handleToggleStatus(reel)}
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    reel.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {reel.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {reel.product?.name || 'No product linked'}
                </p>
                <p className="text-xs text-gray-500">Order: {reel.order}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] rounded-full flex items-center justify-center">
                  <FaPlay className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingReel ? 'Edit Reel' : 'Add New Reel'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video <span className="text-red-500">*</span>
                  </label>

                  {formData.videoUrl ? (
                    <div className="relative rounded-xl overflow-hidden bg-black">
                      <video
                        src={formData.videoUrl}
                        className="w-full aspect-[9/16] max-h-[300px] object-contain"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-[#5A0F1B] hover:bg-[#5A0F1B]/5'
                      }`}
                    >
                      {uploading ? (
                        <div className="space-y-3">
                          <div className="w-12 h-12 mx-auto border-4 border-[#5A0F1B] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600">Uploading... {uploadProgress}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">Click to upload video</p>
                          <p className="text-xs text-gray-400 mt-1">MP4, WebM, MOV (max 100MB)</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Active Status</p>
                    <p className="text-sm text-gray-500">Show this reel on homepage</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.isActive ? 'left-7' : 'left-1'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
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
