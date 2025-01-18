// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import EditProfileModal from '../components/EditProfileModal';
import useSound from '../hooks/useSound';
import editProfileSound from '../assets/sounds/intro-sound-1-269293.mp3';
import { Alert } from 'react-bootstrap';

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profile_picture_url: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const playEditProfileSound = useSound(editProfileSound);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Error al obtener el perfil');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error al obtener el perfil:', err);
        setError('Error al obtener el perfil');
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    playEditProfileSound();

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        playEditProfileSound();
      } else {
        console.error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-picture-container">
          {profile.profile_picture_url ? (
            <img
              src={profile.profile_picture_url}
              alt="Profile"
              className="profile-picture"
              onClick={() => setShowEditModal(true)}
              title="Editar Perfil"
            />
          ) : (
            <div className="profile-placeholder" onClick={() => setShowEditModal(true)}>
              Subir Imagen
            </div>
          )}
        </div>
        <h3>{profile.name}</h3>
        <p>{profile.bio}</p>
        <p>{profile.email}</p>
        <button className="btn btn-info mt-3" onClick={() => setShowEditModal(true)}>
          Editar Perfil
        </button>
      </aside>
      <EditProfileModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        profile={profile}
        handleSave={handleSaveProfile}
      />
    </div>
  );
}

export default ProfilePage;