// frontend/src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

function HomePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;
    fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Bienvenido a Planner2025</h1>
      <p>Página principal de la aplicación.</p>
      {profile?.profile_picture_url && (
        <img
          src={profile.profile_picture_url}
          alt="Mi Foto"
          style={{ width: '100px', height: '100px', borderRadius: '50%' }}
        />
      )}
    </div>
  );
}

export default HomePage;
