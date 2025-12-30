import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingCategory) {
        await API.put(`/admin/categories/${editingCategory._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Category updated successfully');
      } else {
        await API.post('/admin/categories', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Category created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All products in this category will be affected.')) {
      try {
        await API.delete(`/admin/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: null
    });
    setPreviewImage(category.image?.url || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: null
    });
    setEditingCategory(null);
    setPreviewImage('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories Management</h2>
            <p className="text-gray-600 mt-1">Organize your products into categories</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            <FaPlus /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaTags className="text-6xl text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaTags className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Categories Yet</h3>
            <p className="text-gray-600 mb-6">Create your first category to organize products</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Create Your First Category
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  placeholder="e.g., Silk Sarees"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  placeholder="Brief description of this category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
                {previewImage && (
                  <div className="mt-4">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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

export default AdminCategories;
