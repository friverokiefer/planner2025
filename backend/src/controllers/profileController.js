// backend/src/controllers/profileController.js
const Profile = require('../models/profile');
const { validationResult } = require('express-validator');

const profileController = {
  getProfile: async (req, res) => {
    try {
      const profile = await Profile.getProfile();
      if (!profile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      res.status(500).json({ error: 'Error al obtener el perfil' });
    }
  },

  updateProfile: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profileData = {
        ...req.body,
        profile_picture_url: req.body.profile_picture_url,
      };

      const updatedProfile = await Profile.updateProfile(profileData);
      if (!updatedProfile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
  },
};

module.exports = profileController;