const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Menu event listeners
  onMenuNewPatient: (callback) => ipcRenderer.on('menu-new-patient', callback),
  onMenuNewAppointment: (callback) => ipcRenderer.on('menu-new-appointment', callback),
  onMenuDashboard: (callback) => ipcRenderer.on('menu-dashboard', callback),
  onMenuPatients: (callback) => ipcRenderer.on('menu-patients', callback),
  onMenuAppointments: (callback) => ipcRenderer.on('menu-appointments', callback),
  onMenuResults: (callback) => ipcRenderer.on('menu-results', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
