// frontend/src/components/EditProfileModal/EditProfileModal.js

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import './EditProfileModal.css';
import useSound from '../../hooks/useSound';
import editProfileSound from '../../assets/sounds/notification-1-269296.mp3';
import authService from '../../services/authService';
import PropTypes from 'prop-types';

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

  const playEditProfileSound = useSound(editProfileSound);

  // Al abrir el modal, rellena el estado con el perfil actual
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

  // Manejo de campos de texto
  const handleChange = e => {
    const { name, value } = e.target;
    setUpdatedProfile(prev => ({ ...prev, [name]: value }));
  };

  // Manejo de selección de imagen
  const handleImageChange = e => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      // Muestra un preview local
      setUpdatedProfile(prev => ({
        ...prev,
        profile_picture_url: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  // Sube la imagen al backend => /api/upload/profile-picture
  const uploadImage = async () => {
    if (!imageFile) return null; // no hay archivo
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

  // Guardar cambios en el perfil (PUT /api/profile)
  const onSave = async () => {
    setFormError('');
    setFormSuccess('');

    // Validación
    if (!updatedProfile.name.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }

    let finalImageUrl = updatedProfile.profile_picture_url;
    // Si subimos un archivo nuevo, primero lo subimos
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) {
        // Falló subida => no continuamos
        return;
      }
      finalImageUrl = uploadedUrl; // URL devuelta por el backend
    }

    // Comprobamos token
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
      setFormError('No hay usuario autenticado.');
      return;
    }

    // PUT /api/profile
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: updatedProfile.name,
          bio: updatedProfile.bio,
          profile_picture_url: finalImageUrl, // Aseguramos enviar la URL final
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || 'Error al actualizar el perfil');
        return;
      }

      const data = await response.json(); // Perfil actualizado
      // Llamamos a handleSave para actualizar en ProfilePage
      handleSave(data);
      playEditProfileSound();
      setFormSuccess('Perfil actualizado exitosamente.');

      // Cerrar el modal unos milisegundos después
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
                {/* Preview local o actual */}
                <img
                  src={updatedProfile.profile_picture_url}
                  alt="Preview"
                  className="img-preview"
                  style={{ width: 100, height: 100, borderRadius: '50%' }}
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

EditProfileModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    name: PropTypes.string,
    bio: PropTypes.string,
    profile_picture_url: PropTypes.string,
  }).isRequired,
  handleSave: PropTypes.func.isRequired,
};

export default EditProfileModal;
