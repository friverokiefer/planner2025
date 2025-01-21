// frontend/src/components/EditProfileModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import './EditProfileModal.css';
import useSound from '../hooks/useSound';
import editProfileSound from '../assets/sounds/notification-1-269296.mp3';
import authService from '../services/authService';

function EditProfileModal({ show, handleClose, profile, handleSave }) {
  const [updatedProfile, setUpdatedProfile] = useState({
    name: '',
    bio: '',
    profile_picture_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Sonido al editar
  const playEditProfileSound = useSound(editProfileSound);

  // Al abrir el modal, llenar estado con los datos actuales
  useEffect(() => {
    if (show) {
      setUpdatedProfile({
        name: profile.name || '',
        bio: profile.bio || '',
        profile_picture_url: profile.profile_picture_url || '',
      });
      setImageFile(null);
      setUploadError('');
      setFormError('');
      setFormSuccess('');
    }
  }, [profile, show]);

  // Cambios en inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Al elegir un archivo
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      // Aquí podríamos mostrar un preview local con objectURL si queremos
      setUpdatedProfile((prev) => ({
        ...prev,
        profile_picture_url: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  // Subir la imagen al backend
  const uploadImage = async () => {
    if (!imageFile) return null; // no se seleccionó archivo nuevo

    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    try {
      setUploading(true);
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }
      const data = await response.json(); // { imageUrl: 'http://localhost:5000/uploads/...' }
      return data.imageUrl;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setUploadError(error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Guardar los cambios del perfil
  const onSave = async () => {
    setFormError('');
    setFormSuccess('');

    // Validación básica: nombre obligatorio
    if (!updatedProfile.name.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }

    // Subir imagen si hay una nueva
    let finalImageUrl = updatedProfile.profile_picture_url;
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) {
        // Falló subida
        return;
      }
      finalImageUrl = uploadedUrl; // URL final devuelta por el backend
    }

    // Tomar token del usuario
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
      setFormError('No hay usuario autenticado.');
      return;
    }

    try {
      // PUT /api/profile con Bearer Token
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: updatedProfile.name,
          bio: updatedProfile.bio,
          profile_picture_url: finalImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || 'Error al actualizar el perfil');
        return;
      }

      const data = await response.json(); // Perfil actualizado
      // Llamamos a handleSave para actualizar el state en ProfilePage
      handleSave(data);
      playEditProfileSound();
      setFormSuccess('Perfil actualizado exitosamente.');

      // Cerrar modal un poco después
      setTimeout(() => {
        handleClose();
        setFormSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setFormError('Error al actualizar el perfil');
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        handleClose();
        setUploadError('');
        setFormError('');
        setFormSuccess('');
      }}
      centered
    >
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
                {/* Preview local o imagen actual */}
                <img
                  src={updatedProfile.profile_picture_url}
                  alt="Preview"
                  className="img-preview"
                />
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            handleClose();
            setUploadError('');
            setFormError('');
            setFormSuccess('');
          }}
        >
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave} disabled={uploading}>
          {uploading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditProfileModal;
