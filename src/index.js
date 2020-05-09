const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

var fs = require("fs")
var webp = require('webp-converter');
var unrar = require("node-unrar-js");
var zip = require('extract-zip');
var temp = require('temp');


var mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




ipcMain.on('ondragstart', (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: "msg2"
  })
})



ipcMain.on('open-dialog', (event, arg) => {
   getFileFromUser()
})

const getFileFromUser = async () => {
  const files = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
  console.log(files)

  mainWindow.webContents.send('event',files)

   
}




function test() {
  let dir = "/Users/tobiaszillmer/Coding/Comic-Tool/src/img/"
  let i = 0;

  fs.readdir(dir, (err, files) => {
    console.log(err)
    files.forEach(file => {
      
      //console.log(file);


      if(isJpgFile(file))
      console.log(file, 'is jpg')
        convertToWebp(dir + file, i++);
    });
  });
}


function isJpgFile(file) {
  if(file.search(".jpg") != -1 || file.search(".jpeg") != -1 ) {
    return true;
  } else {
    return false;
  }
}

function renameFile(file) {

}



async function unzip () {
  console.log('in main')
  try {
    await zip(path.resolve(__dirname, "a.cbz"), { dir: "/Users/tobiaszillmer/Coding/Comic-Tool/test" })
    console.log('Extraction complete')
  } catch (err) {
    // handle any errors
  }
}


let outputDir = "/Users/tobiaszillmer/Coding/Comic-Tool/src/webp/"

function convertToWebp(input, out) {

  console.log(outputDir, out)

  webp.cwebp(input, outputDir + out + ".webp","-q 80",function(status,error)
    {
      //if conversion successful status will be '100'
      //if conversion fails status will be '101'
      console.log(status,error);	
    });
}



/*
var buf = Uint8Array.from(fs.readFileSync(path.resolve(__dirname, "a.cbr"))).buffer;

var extractor = unrar.createExtractorFromData(buf);
 
var list = extractor.getFileList();

console.log(list)
//if (list[0].state === "SUCCESS") {
  //list[1].arcHeader...
  //list[1].fileHeaders[...]
//}
 

var extracted = extractor.extractAll();
//var extracted = extractor.extractFiles(["1.txt", "1.txt"], "password")();
if (list[0].state === "SUCCESS") {
  //list[1].arcHeader...
  //list[1].files[0].fileHeader: ..
  if (list[1].files[0].extract[0].state === "SUCCESS") {
    list[1].files[0].extract[1] // Uint8Array
  }
}
*/

