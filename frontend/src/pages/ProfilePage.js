// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import EditProfileModal from '../components/EditProfileModal';
import useSound from '../hooks/useSound';
import editProfileSound from '../assets/sounds/intro-sound-1-269293.mp3';
import { Alert } from 'react-bootstrap';
import authService from '../services/authService';

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

  // Al montar, obtenemos el perfil del backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user || !user.token) {
          setError('No hay usuario logueado.');
          return;
        }
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
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

  // Cuando el modal guarde, actualizamos el state local con la info
  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile); // Actualiza la foto, name, bio
    playEditProfileSound();
  };

  // Fallback si la URL está vacía
  const displayImage = profile.profile_picture_url?.trim()
    ? profile.profile_picture_url
    : '/default_silueta.jpeg';

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-picture-container">
          <img
            src={displayImage}
            alt="Profile"
            className="profile-picture"
            onClick={() => setShowEditModal(true)}
            title="Editar Perfil"
          />
        </div>
        <h3>{profile.name}</h3>
        <p>{profile.bio}</p>
        <p>{profile.email}</p>

        <button
          className="btn btn-info mt-3"
          onClick={() => setShowEditModal(true)}
        >
          Editar Perfil
        </button>
      </aside>

      <div className="profile-content">
        {error && <Alert variant="danger">{error}</Alert>}
        {/* Aquí podrías mostrar tareas del user, etc. */}
      </div>

      {/* Modal para editar */}
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
