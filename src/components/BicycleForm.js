import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addBicycle, updateBicycle } from '../features/bicycle/bicycleSlice';
import { compressImage } from '../utils/imageCompression';
import './BicycleForm.css';

export default function BicycleForm({ bike, onClose }) {
  const [serialNumber, setSerialNumber] = useState(bike?.serialNumber || '');
  const [photo, setPhoto] = useState(bike?.photo || null);
  const [contract, setContract] = useState(bike?.contract || null);
  const [purchasePrice, setPurchasePrice] = useState(bike?.purchasePrice || '');
  const [sellingPrice, setSellingPrice] = useState(bike?.sellingPrice || '');
  
  const dispatch = useDispatch();

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const compressedFile = await compressImage(file);
      if (compressedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'photo') {
            setPhoto(reader.result);
          } else {
            setContract(reader.result);
          }
        };
        reader.readAsDataURL(compressedFile);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bikeData = {
      id: bike?.id || Date.now(),
      serialNumber,
      photo,
      contract,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
    };

    if (bike) {
      dispatch(updateBicycle(bikeData));
    } else {
      dispatch(addBicycle(bikeData));
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{bike ? 'Edit Bicycle' : 'Add New Bicycle'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="bicycle-form">
          <div className="form-group">
            <label>Serial Number:</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Enter serial number"
              required
            />
          </div>

          <div className="form-group">
            <label>Purchase Price (€):</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Enter purchase price"
              required
            />
          </div>

          <div className="form-group">
            <label>Selling Price (€):</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="Enter selling price (optional)"
            />
          </div>
          
          <div className="form-group">
            <label>Bicycle Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'photo')}
            />
            {photo && <img src={photo} alt="Preview" className="image-preview" />}
          </div>
          
          <div className="form-group">
            <label>Contract Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'contract')}
            />
            {contract && <img src={contract} alt="Contract Preview" className="image-preview" />}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {bike ? 'Update' : 'Add'} Bicycle
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}