import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { moveToBin, restoreFromBin, deletePermanently } from '../features/bicycle/bicycleSlice';
import BicycleForm from './BicycleForm';
import Dialog from './Dialog';
import './BicycleList.css';

export function BicycleList() {
  const [selectedBikes, setSelectedBikes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [selectedTrashBikes, setSelectedTrashBikes] = useState([]);
  const [sortField, setSortField] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const bicycles = useSelector((state) => state.bicycle.bicycles);
  const deletedBicycles = useSelector((state) => state.bicycle.deletedBicycles);
  const dispatch = useDispatch();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBikes(filteredBicycles.map(bike => bike.id));
    } else {
      setSelectedBikes([]);
    }
  };

  const handleDelete = () => {
    setShowDialog(true);
  };

  const confirmDelete = () => {
    dispatch(moveToBin(selectedBikes));
    setSelectedBikes([]);
    setShowDialog(false);
  };

  const handleRestore = () => {
    dispatch(restoreFromBin(selectedTrashBikes));
    setSelectedTrashBikes([]);
  };

  const handlePermanentDelete = () => {
    dispatch(deletePermanently(selectedTrashBikes));
    setSelectedTrashBikes([]);
  };

  const handleSingleRestore = (bikeId) => {
    dispatch(restoreFromBin([bikeId]));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getFilteredAndSortedBicycles = () => {
    // Önce arama filtresini uygula
    let filtered = [...bicycles].filter(bike =>
      bike.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Sonra durum filtresini uygula
    switch (filterStatus) {
      case 'sold':
        filtered = filtered.filter(bike => 
          bike.sellingPrice && bike.sellingPrice > 0
        );
        break;
      case 'inStock':
        filtered = filtered.filter(bike => 
          !bike.sellingPrice || bike.sellingPrice === 0 || bike.sellingPrice === ''
        );
        break;
      default: // 'all'
        break;
    }
  
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'serialNumber':
          comparison = a.serialNumber.localeCompare(b.serialNumber);
          break;
        case 'purchasePrice':
          comparison = a.purchasePrice - b.purchasePrice;
          break;
        case 'sellingPrice':
          // Satış fiyatı olmayanları en sona koy
          if (!a.sellingPrice && !b.sellingPrice) comparison = 0;
          else if (!a.sellingPrice) comparison = 1;
          else if (!b.sellingPrice) comparison = -1;
          else comparison = a.sellingPrice - b.sellingPrice;
          break;
        case 'profit':
          const profitA = a.sellingPrice ? a.sellingPrice - a.purchasePrice : 0;
          const profitB = b.sellingPrice ? b.sellingPrice - b.purchasePrice : 0;
          comparison = profitA - profitB;
          break;
        case 'dateAdded':
          comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filteredBicycles = getFilteredAndSortedBicycles();

  const totals = filteredBicycles.reduce((acc, bike) => ({
    totalPurchase: acc.totalPurchase + bike.purchasePrice,
    totalSelling: acc.totalSelling + (bike.sellingPrice || 0),
    totalProfit: acc.totalProfit + (bike.profit || 0)
  }), { totalPurchase: 0, totalSelling: 0, totalProfit: 0 });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon">↕</span>;
    return sortDirection === 'asc' ? 
      <span className="sort-icon active">↑</span> : 
      <span className="sort-icon active">↓</span>;
  };

  return (
    <div className="bicycle-list">
      <div className="page-header">
        <h1>Bike List</h1>
      </div>
      <div className="totals-section">
        <div className="total-item">
          <label>Total Purchase:</label>
          <span>€{totals.totalPurchase.toFixed(2)}</span>
        </div>
        <div className="total-item">
          <label>Total Selling:</label>
          <span>€{totals.totalSelling.toFixed(2)}</span>
        </div>
        <div className="total-item">
          <label>Total Profit:</label>
          <span>€{totals.totalProfit.toFixed(2)}</span>
        </div>
      </div>

      <div className="list-header">
      <button 
        className="delete-btn"
        disabled={selectedBikes.length === 0}
        onClick={handleDelete}
      >
        Delete Selected
      </button>
      <div className="header-controls">
        <h2>Bicycle Inventory</h2>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="all">Show All</option>
          <option value="sold">Show Sold</option>
          <option value="inStock">Show In Stock</option>
        </select>
      </div>
      <div className="right-buttons">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          className="trash-btn"
          onClick={() => setShowTrash(!showTrash)}
        >
          {showTrash ? 'Show Inventory' : 'Show Trash'}
          {deletedBicycles.length > 0 && 
            <span className="trash-count">{deletedBicycles.length}</span>
          }
        </button>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
    Add New Bicycle
  </button>
        </div>
      </div>

      {!showTrash ? (
        <div className="list-container">
          <div className="list-headers">
            <div className="header-cell checkbox-cell">
              <input 
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedBikes.length === filteredBicycles.length && filteredBicycles.length > 0}
              />
            </div>
            <div 
              className="header-cell sortable"
              onClick={() => handleSort('serialNumber')}
            >
              Serial Number <SortIcon field="serialNumber" />
            </div>
            <div className="header-cell">Bicycle Photo</div>
            <div className="header-cell">Contract</div>
            <div 
              className="header-cell sortable"
              onClick={() => handleSort('purchasePrice')}
            >
              Purchase Price <SortIcon field="purchasePrice" />
            </div>
            <div 
              className="header-cell sortable"
              onClick={() => handleSort('sellingPrice')}
            >
              Selling Price <SortIcon field="sellingPrice" />
            </div>
            <div 
              className="header-cell sortable"
              onClick={() => handleSort('profit')}
            >
              Profit <SortIcon field="profit" />
            </div>
            <div 
              className="header-cell sortable"
              onClick={() => handleSort('dateAdded')}
            >
              Date Added <SortIcon field="dateAdded" />
            </div>
            <div className="header-cell">Actions</div>
          </div>

          <div className="list-content">
            {filteredBicycles.map((bike) => (
              <div 
                key={bike.id} 
                className={`bike-row ${bike.sellingPrice ? 'sold-bike' : ''}`}
              >
                <div className="cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedBikes.includes(bike.id)}
                    onChange={() => {
                      setSelectedBikes(prev => 
                        prev.includes(bike.id)
                          ? prev.filter(id => id !== bike.id)
                          : [...prev, bike.id]
                      );
                    }}
                  />
                </div>
                <div className="cell serial-number">{bike.serialNumber}</div>
                <div className="cell">
                  <img src={bike.photo} alt="Bicycle" className="bike-thumbnail" />
                </div>
                <div className="cell">
                  {bike.contract && 
                    <img src={bike.contract} alt="Contract" className="contract-thumbnail" />
                  }
                </div>
                <div className="cell price">€{bike.purchasePrice.toFixed(2)}</div>
                <div className="cell price">
                  {bike.sellingPrice ? `€${bike.sellingPrice.toFixed(2)}` : '-'}
                </div>
                <div className="cell price">
                  {bike.profit !== null ? `€${bike.profit.toFixed(2)}` : '-'}
                </div>
                <div className="cell date-cell">
                  <div className="date">
                    {isNaN(new Date(bike.dateAdded)) ? '-' : new Date(bike.dateAdded).toLocaleDateString()}
                  </div>
                  <div className="time">
                    {isNaN(new Date(bike.dateAdded)) ? '-' : new Date(bike.dateAdded).toLocaleTimeString()}
                  </div>
                </div>
                <div className="cell actions">
                  <button className="edit-btn" onClick={() => setEditingBike(bike)}>
                    Edit
                  </button>
                  <button 
                    className="delete-single-btn" 
                    onClick={() => {
                      setSelectedBikes([bike.id]);
                      handleDelete();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Çöp kutusu görünümü
        <div className="list-container">
          <div className="trash-header">
            <h3>Trash Bin</h3>
            {selectedTrashBikes.length > 0 && (
              <div className="trash-actions">
                <button className="restore-btn" onClick={handleRestore}>
                  Restore Selected
                </button>
                <button className="permanent-delete-btn" onClick={handlePermanentDelete}>
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
          <div className="list-content">
            {deletedBicycles.map((bike) => (
              <div key={bike.id} className="bike-row">
                <div className="cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedTrashBikes.includes(bike.id)}
                    onChange={() => {
                      setSelectedTrashBikes(prev => 
                        prev.includes(bike.id)
                          ? prev.filter(id => id !== bike.id)
                          : [...prev, bike.id]
                      );
                    }}
                  />
                </div>
                <div className="cell serial-number">{bike.serialNumber}</div>
                <div className="cell">
                  <img src={bike.photo} alt="Bicycle" className="bike-thumbnail" />
                </div>
                <div className="cell">
                  {bike.contract && 
                    <img src={bike.contract} alt="Contract" className="contract-thumbnail" />
                  }
                </div>
                <div className="cell price">${bike.purchasePrice.toFixed(2)}</div>
                <div className="cell price">
                  {bike.sellingPrice ? `€${bike.sellingPrice.toFixed(2)}` : '-'}
                </div>
                <div className="cell price">
                  {bike.profit !== null ? `€${bike.profit.toFixed(2)}` : '-'}
                </div>
                <div className="cell date-cell">
                  <div className="date">
                    {isNaN(new Date(bike.dateAdded)) ? '-' : new Date(bike.dateAdded).toLocaleDateString()}
                  </div>
                  <div className="time">
                    {isNaN(new Date(bike.dateAdded)) ? '-' : new Date(bike.dateAdded).toLocaleTimeString()}
                  </div>
                </div>
                <div className="cell actions">
                  <button 
                    className="restore-btn"
                    onClick={() => handleSingleRestore(bike.id)}
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <BicycleForm
          onClose={() => setShowAddForm(false)}
        />
      )}

      {editingBike && (
        <BicycleForm
          bike={editingBike}
          onClose={() => setEditingBike(null)}
        />
      )}

      <Dialog
        open={showDialog}
        title="Confirm Delete"
        message="Are you sure you want to move the selected bicycles to trash?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDialog(false)}
      />
    </div>
  );
}

export default BicycleList;