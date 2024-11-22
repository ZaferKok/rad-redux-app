import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bicycles: [],
  deletedBicycles: [],
};

const bicycleSlice = createSlice({
  name: 'bicycle',
  initialState,
  reducers: {
    addBicycle: (state, action) => {
      const sellingPrice = action.payload.sellingPrice 
        ? parseFloat(action.payload.sellingPrice) 
        : null;
      
      const purchasePrice = parseFloat(action.payload.purchasePrice);
      
      const profit = sellingPrice 
        ? sellingPrice - purchasePrice 
        : null;

      state.bicycles.push({
        ...action.payload,
        sellingPrice,
        purchasePrice,
        profit,
        dateAdded: new Date().toISOString() // ISO string formatında tarih
      });
    },
    
    updateBicycle: (state, action) => {
      const index = state.bicycles.findIndex(bike => bike.id === action.payload.id);
      if (index !== -1) {
        const sellingPrice = action.payload.sellingPrice 
          ? parseFloat(action.payload.sellingPrice) 
          : null;
        
        const purchasePrice = parseFloat(action.payload.purchasePrice);
        
        const profit = sellingPrice 
          ? sellingPrice - purchasePrice 
          : null;

        state.bicycles[index] = {
          ...action.payload,
          sellingPrice,
          purchasePrice,
          profit,
        };
      }
    },
    moveToBin: (state, action) => {
      const bikesToDelete = action.payload;
      const movedBikes = state.bicycles.filter(bike => bikesToDelete.includes(bike.id));
      state.deletedBicycles.push(...movedBikes);
      state.bicycles = state.bicycles.filter(bike => !bikesToDelete.includes(bike.id));
    },
    restoreFromBin: (state, action) => {
      const bikesToRestore = action.payload;
      const restoredBikes = state.deletedBicycles.filter(bike => bikesToRestore.includes(bike.id));
      state.bicycles.push(...restoredBikes);
      state.deletedBicycles = state.deletedBicycles.filter(bike => !bikesToRestore.includes(bike.id));
    },
    deletePermanently: (state, action) => {
      const bikesToDelete = action.payload;
      state.deletedBicycles = state.deletedBicycles.filter(bike => !bikesToDelete.includes(bike.id));
    },
  },
});

export const { 
  addBicycle, 
  updateBicycle, 
  moveToBin, 
  restoreFromBin, 
  deletePermanently 
} = bicycleSlice.actions;

export default bicycleSlice.reducer;