import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import './EditProfileModal.css';
import useSound from '../hooks/useSound';
import editProfileSound from '../assets/sounds/notification-1-269296.mp3';

function EditProfileModal({ show, handleClose, profile, handleSave }) {
  const [updatedProfile, setUpdatedProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profile_picture_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const playEditProfileSound = useSound(editProfileSound);

  useEffect(() => {
    if (show) {
      setUpdatedProfile({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        profile_picture_url: profile.profile_picture_url || '',
      });
      setImageFile(null);
      setUploadError('');
      setFormError('');
      setFormSuccess('');
    }
  }, [profile, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile({ ...updatedProfile, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setUpdatedProfile({
        ...updatedProfile,
        profile_picture_url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    try {
      setUploading(true);
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setUploadError(error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    setFormError('');
    setFormSuccess('');

    if (!updatedProfile.name.trim() || !updatedProfile.email.trim()) {
      setFormError('El nombre y el email son obligatorios.');
      return;
    }

    let imageUrl = updatedProfile.profile_picture_url;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        return;
      }
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedProfile, profile_picture_url: imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        handleSave(data);
        playEditProfileSound();
        setFormSuccess('Perfil actualizado exitosamente.');
        setTimeout(() => {
          handleClose();
          setFormSuccess('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setFormError('Error al actualizar el perfil');
    }
  };

  return (
    <Modal show={show} onHide={() => { handleClose(); setUploadError(''); setFormError(''); setFormSuccess(''); }} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {formSuccess && <Alert variant="success">{formSuccess}</Alert>}
        {uploadError && <Alert variant="danger">{uploadError}</Alert>}
        <Form>
          <Form.Group controlId="formProfileName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={updatedProfile.name}
              onChange={handleChange}
              placeholder="Ingrese su nombre"
              required
            />
          </Form.Group>

          <Form.Group controlId="formProfileEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={updatedProfile.email}
              onChange={handleChange}
              placeholder="Ingrese su email"
              required
            />
          </Form.Group>

          <Form.Group controlId="formProfileBio" className="mt-3">
            <Form.Label>Biografía</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="bio"
              value={updatedProfile.bio}
              onChange={handleChange}
              placeholder="Ingrese una breve biografía"
            />
          </Form.Group>

          <Form.Group controlId="formImageUpload" className="mt-3">
            <Form.Label>Imagen de Perfil</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {updatedProfile.profile_picture_url && (
              <div className="mt-3">
                <img
                  src={updatedProfile.profile_picture_url}
                  alt="Profile Preview"
                  className="img-preview"
                />
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { handleClose(); setUploadError(''); setFormError(''); setFormSuccess(''); }}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave} disabled={uploading}>
          {uploading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Guardar Cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditProfileModal;