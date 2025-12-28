const SiteSetting = require('../models/SiteSetting');

// Get all settings (public - only non-sensitive ones)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.find({
      key: { $in: ['reels_enabled', 'cod_enabled', 'site_name', 'site_description'] }
    });

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Get all settings (admin)
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.find();

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Get single setting
exports.getSetting = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    res.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting'
    });
  }
};

// Update or create setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }

    let setting = await SiteSetting.findOne({ key });

    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    } else {
      setting = new SiteSetting({ key, value, description });
      await setting.save();
    }

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    });
  }
};

// Bulk update settings
exports.bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }

    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        SiteSetting.findOneAndUpdate(
          { key },
          { key, value },
          { upsert: true, new: true }
        )
      );
    }

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Delete setting
exports.deleteSetting = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    await setting.deleteOne();

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete setting'
    });
  }
};
