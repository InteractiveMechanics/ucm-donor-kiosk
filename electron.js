import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';
import { spawn } from 'child_process';
import dataService from './dataService.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let nextServer;

async function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'server.js');
    console.log('Starting server with:', { serverPath, isDev: !app.isPackaged });

    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server file not found at ${serverPath}`));
      return;
    }

    const env = {
      ...process.env,
      NODE_ENV: app.isPackaged ? 'production' : 'development',
      PORT: '3000',
      NEXT_TELEMETRY_DISABLED: '1'
    };

    nextServer = spawn('node', [serverPath], { 
      env,
      stdio: 'pipe'
    });

    nextServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Server stdout: ${output}`);
      if (output.includes('Ready on http://localhost:3000')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Server stderr: ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    // Set a timeout for server startup
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 10000);
  });
}

async function initializeData() {
  try {
    console.log('Starting to initialize data...');
    const [stories, help, donors] = await Promise.all([
      dataService.fetchStories().catch(error => {
        console.error('Error fetching stories:', error);
        return null;
      }),
      dataService.fetchHelp().catch(error => {
        console.error('Error fetching help:', error);
        return null;
      }),
      dataService.fetchDonors().catch(error => {
        console.error('Error fetching donors:', error);
        return null;
      })
    ]);

    if (!stories && !help && !donors) {
      throw new Error('Failed to fetch any data');
    }

    return { stories, help, donors };
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
}

function createWindow() {
  // Clear any existing session data
  session.defaultSession.clearStorageData({
    storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
  });

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Set CSP headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:3000 http://localhost:1337;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: http://localhost:3000 http://localhost:1337;",
          "connect-src 'self' http://localhost:3000 http://localhost:1337 ws://localhost:3000;",
          "worker-src 'self' blob:;"
        ].join(' ')
      }
    });
  });

  const startUrl = 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Clear cache after window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.session.clearCache();
  });

  // Handle navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

app.on('ready', async () => {
  try {
    console.log('App is ready, starting initialization...');
    console.log('App path:', app.getAppPath());
    console.log('Resources path:', app.getPath('exe'));
    console.log('__dirname:', __dirname);
    console.log('Current working directory:', process.cwd());
    console.log('Is production:', app.isPackaged);

    await startServer();
    await initializeData();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('App is quitting, cleaning up...');
  if (nextServer) {
    console.log('Killing server process...');
    nextServer.kill();
  }
});