const {
  app,
  BrowserWindow,
  dialog,
  ipcMain
} = require('electron');
const path = require('path');

var fs = require("fs")
var webp = require('webp-converter');
var unrar = require("node-unrar-js");
var zip = require('extract-zip');
var zipFolder = require('zip-a-folder');
var rimraf = require('rimraf');
var temp = require('temp');

var originalFilename = '';

var mainWindow;
var qualtiy = 80;
var filesArray = [];

var fileCounter = 0;
var totalFilesCount = 0;

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
  
});


ipcMain.on('start-convert', (event, arg) => {
  quality = arg.quality
  createFolders();


  //main loop 
  for (let i = 0; i < filesArray.length; i++) {
    let promiseArray = [];

    if(hasEmptySpaces(filesArray[i].file)) {
      console.log('trueee')
      promiseArray.push(renameFile(filesArray[i]))
    } else {
      console.log('go on')
    }

    
    Promise.all(promiseArray).then(() => {
      //console.log('later',filesArray[i])
      unzip(filesArray[i])
    })
    .catch(reason => {
      console.log(reason)
    })
  }
})



ipcMain.on('open-dialog', (event, arg) => {
  getFileFromUser()
})

const getFileFromUser = async () => {
  const files = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })

  let parts = files.filePaths[0].split('/')

  let thePath = files.filePaths[0].substring(0, files.filePaths[0].length - parts[parts.length-1].length)
  
  //console.log('length', parts[parts.length-1], parts[parts.length-1].length)

  let fileObject = {
    fullpath: files.filePaths[0],
    file: parts[parts.length-1],
    path: thePath,
    originalName: parts[parts.length-1]
  }

  //console.log(tmp)
  filesArray.push(fileObject);

  mainWindow.webContents.send('event', files)


}



function createFolders() {
  fs.exists(__dirname + '/tmp', (exists) => {
    if (!exists) {
      fs.mkdir(__dirname + '/tmp', () => {});
    }
  });

  fs.exists(__dirname + '/webp', (exists) => {
    if (!exists) {
      fs.mkdir(__dirname + '/webp', () => {});
    }
  });


}



function convertBatch() {
  let dir = __dirname + "/tmp/"

  fs.readdir(dir, (err, files) => {
    
    /*
    if(hasEmptySpaces(files[0])) {
      removeSpaces(dir, files[0], )

      }
    }
    */


    hasEmptySpaces(dir, files[0], function () {


      fs.readdir(dir, (err, files) => {
        //console.log('fff', files)
        convertComic(dir + files[0])
      })


    })
  });
}


function bla() {
  return new Promise((resolve, reject) => {
    let a = 1 + 1
  
    if(a == 2) {
      resolve('succ')
    } else {
      reject('failed')
    }
  });
}

 


bla().then( (msg) => {
  console.log('this', msg)
}).catch((msg) => {
  console.log('this ia err', msg)
})


function hasEmptySpaces(name) {
  console.log(name)
  if (name.indexOf(" ") >= 0) {
    return true;
  } else {
    return false;
  }
}


/*
function hasEmptySpaces(dir, files, cb) {
  if (files.indexOf(" ")) {
    fs.rename(dir + files, dir + removeSpaces(files), function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log("Successfully renamed the directory.")
        cb();
      }
    })
  }
}
*/

function convertComic(filePath) {

  let i = 0;

  fs.readdir(filePath, (err, files) => {
    files.forEach(file => {
      if (isJpgFile(file)) {
        anotherName(filePath, file, function () {
          
        })

      }
    });
  })

convert(filePath);


}




function convert(filePath) {
  
  let dir = __dirname + "/tmp/"
  
  i = 0;

  fs.readdir(dir, (err, files) => {
    fs.readdir(dir +'/' + files, (err, file) => {
    console.log('length',file.length)
    totalFilesCount = file.length
      file.forEach(item => {
        console.log('eeee', dir, files[0], '/', item)
        convertToWebp(dir  + '/' + files[0] + '/', item); 
      })

  
    });
  }
  

  );

  
}



function anotherName(filePath, fileName, cb) {
  //console.log('input', filePath + '   ' + fileName)
  //console.log('out', filePath + '   ' + removeSpaces(fileName) + '   ' + '.webp')
  fs.rename(filePath + '/' + fileName, filePath + '/' + removeSpaces(fileName), () => {
    //console.log('done rename', newName)
    cb();
  })
}





function isJpgFile(file) {
  if (file.search(".jpg") != -1 || file.search(".jpeg") != -1) {
    return true;
  } else {
    return false;
  }
}

function renameFile(filePath, cb) {
  return new Promise((resolve, reject) => {
    //console.log('aaa',removeSpaces(filePath.fullpath))
    fs.rename(filePath.fullpath, removeSpaces(filePath.fullpath), (err) => {
      filePath.file = removeSpaces(filePath.file)
      filePath.fullpath = filePath.path + filePath.file
      //console.log('err', err)
      resolve()
    })


  })
}



function removeSpaces(fileName) {
  //console.log('name', fileName)
  fileName = fileName.replace(/\s/g, '-')
  return fileName
}



async function unzip(file) {
  console.log('unzip', file)

  /*
  try {
    await zip(path.resolve(file), {
      dir: __dirname + "/tmp/"
    },)
    console.log('Extraction complete')
    convertBatch()
  } catch (err) {
    console.log('unzip error', err)
    // handle any errors
  }
  */
}


let outputDir = __dirname + "/webp/"




function convertToWebp(inputPath, fileName) {
  console.log(' output dir',inputPath, fileName)

  
  
  webp.cwebp(inputPath + '/' + fileName, outputDir + removeFileEnd(fileName) + ".webp", "-q "+quality, function (status, error) {
    //if conversion successful status will be '100'
    //if conversion fails status will be '101'
    console.log(status, error);
    fileCounter++;
    if(fileCounter == totalFilesCount) {
      console.log('conversion complete')
      
      packFiles();
    }
  });
  
  
}


function  packFiles() {
    zipFolder.zipFolder(__dirname  + '/webp', __dirname + "/out.cbz", function(err) {
    if(err) {
      console.log('oh no!', err);
  } else {
      console.log('EXCELLENT');
      deleteFolders();
  }
  })
}


function deleteFolders() {
  rimraf(__dirname + '/webp',() => {
    console.log('done')
  });

  rimraf(__dirname + '/tmp',() => {
    console.log('done 2')
  })
}



function removeFileEnd(fileName) {
  let tmp = fileName.split('.')
  return tmp[0]
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