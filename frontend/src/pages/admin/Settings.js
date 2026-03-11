import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaMobileAlt, FaKey, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import API from '../../utils/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    reels_enabled: true,
    cod_enabled: true,
    test_accounts: []
  });

  // Test Account Form State
  const [showTestAccountForm, setShowTestAccountForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [testAccountForm, setTestAccountForm] = useState({
    phone: '',
    otp: '1234',
    description: '',
    enabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      console.log('Admin settings response:', data);
      const fetchedSettings = data.settings || { reels_enabled: true, cod_enabled: true, test_accounts: [] };
      // Ensure test_accounts is always an array
      if (!fetchedSettings.test_accounts || !Array.isArray(fetchedSettings.test_accounts)) {
        fetchedSettings.test_accounts = [];
      }
      setSettings(fetchedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReels = async (enabled) => {
    setSaving(true);
    try {
      await API.post('/settings', {
        key: 'reels_enabled',
        value: enabled,
        description: 'Enable or disable the product reels section on the home page'
      });
      setSettings(prev => ({ ...prev, reels_enabled: enabled }));
      toast.success(`Reels section ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCOD = async (enabled) => {
    setSaving(true);
    try {
      await API.post('/settings', {
        key: 'cod_enabled',
        value: enabled,
        description: 'Enable or disable Cash on Delivery payment option'
      });
      setSettings(prev => ({ ...prev, cod_enabled: enabled }));
      toast.success(`Cash on Delivery ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  // Test Account Functions
  const handleAddTestAccount = () => {
    setEditingIndex(null);
    setTestAccountForm({
      phone: '',
      otp: '1234',
      description: '',
      enabled: true
    });
    setShowTestAccountForm(true);
  };

  const handleEditTestAccount = (index) => {
    setEditingIndex(index);
    setTestAccountForm({ ...settings.test_accounts[index] });
    setShowTestAccountForm(true);
  };

  const handleSaveTestAccount = async () => {
    // Validate phone number
    if (!testAccountForm.phone || !/^[0-9]{10}$/.test(testAccountForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate OTP
    if (!testAccountForm.otp || !/^[0-9]{4,6}$/.test(testAccountForm.otp)) {
      toast.error('Please enter a valid 4-6 digit OTP');
      return;
    }

    setSaving(true);
    try {
      let updatedAccounts = [...settings.test_accounts];

      if (editingIndex !== null) {
        // Update existing
        updatedAccounts[editingIndex] = testAccountForm;
      } else {
        // Check if phone already exists
        const exists = updatedAccounts.some(acc => acc.phone === testAccountForm.phone);
        if (exists) {
          toast.error('This phone number already exists in test accounts');
          setSaving(false);
          return;
        }
        // Add new
        updatedAccounts.push(testAccountForm);
      }

      await API.post('/settings', {
        key: 'test_accounts',
        value: updatedAccounts,
        description: 'Test accounts with fixed OTP for testing purposes'
      });

      setSettings(prev => ({ ...prev, test_accounts: updatedAccounts }));
      setShowTestAccountForm(false);
      setEditingIndex(null);
      toast.success(editingIndex !== null ? 'Test account updated successfully' : 'Test account added successfully');
    } catch (error) {
      console.error('Error saving test account:', error);
      toast.error('Failed to save test account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestAccount = async (index) => {
    if (!window.confirm('Are you sure you want to delete this test account?')) {
      return;
    }

    setSaving(true);
    try {
      const updatedAccounts = settings.test_accounts.filter((_, i) => i !== index);

      await API.post('/settings', {
        key: 'test_accounts',
        value: updatedAccounts,
        description: 'Test accounts with fixed OTP for testing purposes'
      });

      setSettings(prev => ({ ...prev, test_accounts: updatedAccounts }));
      toast.success('Test account deleted successfully');
    } catch (error) {
      console.error('Error deleting test account:', error);
      toast.error('Failed to delete test account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTestAccount = async (index) => {
    setSaving(true);
    try {
      const updatedAccounts = [...settings.test_accounts];
      updatedAccounts[index] = {
        ...updatedAccounts[index],
        enabled: !updatedAccounts[index].enabled
      };

      await API.post('/settings', {
        key: 'test_accounts',
        value: updatedAccounts,
        description: 'Test accounts with fixed OTP for testing purposes'
      });

      setSettings(prev => ({ ...prev, test_accounts: updatedAccounts }));
      toast.success(`Test account ${updatedAccounts[index].enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling test account:', error);
      toast.error('Failed to update test account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2d7d32]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Site Settings</h1>

      <div className="space-y-6">
        {/* Home Page Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Home Page Settings</h2>
            <p className="text-sm text-gray-600">Manage the visibility of sections on the home page</p>
          </div>

          {/* Reels Section Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Product Reels Section</h3>
              <p className="text-sm text-gray-600 mt-1">
                Show or hide the product reels carousel on the home page
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => handleToggleReels(!settings.reels_enabled)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2d7d32] focus:ring-offset-2 ${
                  settings.reels_enabled ? 'bg-[#2d7d32]' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.reels_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {settings.reels_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* COD Section Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Cash on Delivery (COD)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enable or disable COD payment option at checkout
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => handleToggleCOD(!settings.cod_enabled)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2d7d32] focus:ring-offset-2 ${
                  settings.cod_enabled ? 'bg-[#2d7d32]' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.cod_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {settings.cod_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Accounts Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="border-b pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Test Accounts</h2>
                <p className="text-sm text-gray-600">
                  Configure test accounts with fixed OTP (default: 1234) for testing login without sending actual WhatsApp messages
                </p>
              </div>
              <button
                onClick={handleAddTestAccount}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-[#2d7d32] text-white rounded-lg hover:bg-[#1e6623] transition disabled:opacity-50"
              >
                <FaPlus className="mr-2" />
                Add Test Account
              </button>
            </div>
          </div>

          {/* Test Accounts List */}
          {settings.test_accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaMobileAlt className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>No test accounts configured</p>
              <p className="text-sm mt-1">Add a test account to enable fixed OTP login for testing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.test_accounts.map((account, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    account.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${account.enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <FaMobileAlt className={`text-xl ${account.enabled ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{account.phone}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          account.enabled ? 'bg-green-200 text-green-800' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {account.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <FaKey className="mr-1.5 text-gray-400" />
                        <span>OTP: <strong>{account.otp}</strong></span>
                        {account.description && (
                          <span className="ml-3 text-gray-500">• {account.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleTestAccount(index)}
                      disabled={saving}
                      className={`p-2 rounded-lg transition ${
                        account.enabled
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                      title={account.enabled ? 'Disable' : 'Enable'}
                    >
                      {account.enabled ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                    </button>
                    <button
                      onClick={() => handleEditTestAccount(index)}
                      disabled={saving}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTestAccount(index)}
                      disabled={saving}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warning Info */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Test accounts bypass OTP verification for testing purposes only. Do not use real customer phone numbers. Remove test accounts before going to production.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Changes will take effect immediately on the website. Users may need to refresh their browser to see the updates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Account Form Modal */}
      {showTestAccountForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowTestAccountForm(false)}
            />

            {/* Modal */}
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl relative z-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editingIndex !== null ? 'Edit Test Account' : 'Add Test Account'}
              </h3>

              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                    <input
                      type="text"
                      value={testAccountForm.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setTestAccountForm(prev => ({ ...prev, phone: value }));
                      }}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7d32] focus:border-transparent"
                      disabled={editingIndex !== null}
                    />
                  </div>
                  {editingIndex !== null && (
                    <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed. Delete and create new instead.</p>
                  )}
                </div>

                {/* OTP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={testAccountForm.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setTestAccountForm(prev => ({ ...prev, otp: value }));
                    }}
                    placeholder="Enter 4-6 digit OTP (default: 1234)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7d32] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">This OTP will be used instead of sending WhatsApp message</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={testAccountForm.description}
                    onChange={(e) => setTestAccountForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., QA Testing, Demo Account"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7d32] focus:border-transparent"
                  />
                </div>

                {/* Enabled Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Enable this test account</span>
                  <button
                    type="button"
                    onClick={() => setTestAccountForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      testAccountForm.enabled ? 'bg-[#2d7d32]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        testAccountForm.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTestAccountForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTestAccount}
                  disabled={saving}
                  className="px-4 py-2 bg-[#2d7d32] text-white rounded-lg hover:bg-[#1e6623] transition disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    editingIndex !== null ? 'Update' : 'Add Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
