import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    reels_enabled: true,
    cod_enabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      console.log('Admin settings response:', data);
      setSettings(data.settings || { reels_enabled: true, cod_enabled: true });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5A0F1B]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Site Settings</h1>

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
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:ring-offset-2 ${
                settings.reels_enabled ? 'bg-[#5A0F1B]' : 'bg-gray-200'
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
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:ring-offset-2 ${
                settings.cod_enabled ? 'bg-[#5A0F1B]' : 'bg-gray-200'
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

        {/* Additional Settings Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
    </div>
  );
};

export default Settings;
