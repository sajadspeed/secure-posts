const {app, BrowserWindow, BrowserView} = require('electron')

let win
let createWindow = ()=> {
   win = new BrowserWindow(
	{
		show: false, 
		webPreferences: {
			nodeIntegration: true,
            contextIsolation: false,
			enableRemoteModule: true
		}
	})
   win.menuBarVisible = false;
   win.title = "SajadSpeed Personal Posts"
   win.maximize();
   win.show();
   win.loadFile("./src/index.html");
   const fs = "test";
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
	  app.quit()
	}
  })