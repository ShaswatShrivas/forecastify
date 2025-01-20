const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadURL('http://localhost:3000')
  mainWindow.on('close', handleCloseEvent)
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('get-ip-address', async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json')
    return response.data.ip // Send IP to renderer process
  } catch (error) {
    console.error('Error fetching IP address:', error)
    return { error: 'Failed to fetch IP address' }
  }
})

ipcMain.on('minimize-window', () => {
  console.log('window minimized')
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
      console.log('window size is reset to normal')
    } else {
      mainWindow.maximize()
      console.log('window size is maximized')
    }
  }
})

ipcMain.on('close-window', () => {
  handleCloseEvent()
})

function handleCloseEvent() {
  console.log('closing the window') // logging the message
  if (mainWindow) {
    mainWindow.removeListener('close', handleCloseEvent) // Remove the close listener
    mainWindow.close()
    mainWindow = null
  }
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
