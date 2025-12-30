import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    cta: 'Shop Now',
    link: '/products',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const { data } = await API.get('/sliders');
      setSliders(data.sliders || []);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      toast.error('Failed to fetch sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('cta', formData.cta);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingSlider) {
        await API.put(`/sliders/${editingSlider._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Slider updated successfully');
      } else {
        await API.post('/sliders', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Slider created successfully');
      }

      fetchSliders();
      closeModal();
    } catch (error) {
      console.error('Error saving slider:', error);
      toast.error(error.response?.data?.message || 'Failed to save slider');
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      description: slider.description,
      image: slider.image,
      cta: slider.cta,
      link: slider.link,
      order: slider.order,
      isActive: slider.isActive
    });
    setImagePreview(slider.image.startsWith('http') ? slider.image : `${process.env.REACT_APP_API_URL}${slider.image}`);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        await API.delete(`/sliders/${id}`);
        toast.success('Slider deleted successfully');
        fetchSliders();
      } catch (error) {
        console.error('Error deleting slider:', error);
        toast.error('Failed to delete slider');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlider(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      cta: 'Shop Now',
      link: '/products',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Slider Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg"
        >
          <FaPlus /> Add New Slider
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5A0F1B]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtitle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sliders.map((slider) => (
                <tr key={slider._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={slider.image.startsWith('http') ? slider.image : `${process.env.REACT_APP_API_URL}${slider.image}`}
                      alt={slider.title}
                      className="h-16 w-24 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{slider.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{slider.subtitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{slider.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {slider.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(slider)}
                      className="text-[#5A0F1B] hover:text-[#7A1525] mr-3"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(slider._id)}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingSlider ? 'Edit Slider' : 'Add New Slider'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                  )}
                  <p className="text-xs text-gray-500 mt-1">Or enter image URL below</p>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      name="cta"
                      value={formData.cta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]"
                    />
                  </div>
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
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
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
                    {editingSlider ? 'Update' : 'Create'}
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

export default Sliders;
