var express = require('express');
var http = require('http');
var path = require('path');
const cors = require('cors');
const fs = require('fs');
const xlsx = require('xlsx');
const AdmZip = require('adm-zip');
var FileReader = require('filereader')
const employees= require('./config');
const googleStorage = require('@google-cloud/storage');
const { uuid } = require('uuidv4');

const storage = new googleStorage.Storage({
    projectId: 'angular9crud-36adf',
   appId: '1:937342418081:web:7c87db134715e47b84c4e0',
   databaseURL: 'https://angular9crud-36adf-default-rtdb.firebaseio.com',
   storageBucket: 'angular9crud-36adf.appspot.com',
   locationId: 'us-central',
   apiKey: 'AIzaSyD6iaedGg33wZRzqPZ0RAShzitiKdV_X70',
   authDomain: 'angular9crud-36adf.firebaseapp.com',
   messagingSenderId: '937342418081',
   measurementId: 'G-PW64CZM2G0'
});


var bucket = storage.bucket("gs://angular9crud-36adf.appspot.com");



const  { getFirestore, collection, getDocs } = require('firebase/firestore/lite');
const fileupload = require("express-fileupload");
const  request = require('request'); 
const folderNames=[];
var appServer = express();
const bodyparser = require('body-parser');


appServer.use(cors());
appServer.use(express.static(path.join(__dirname, '')));
appServer.use(express.json());
appServer.use(bodyparser());
function parse(url){
    console.log(url);
      return new Promise(function(resolve, reject){
          request({url: url, encoding : null}, function (error, response, body) {
              if (error) return reject(error);
              try {
                  resolve(response);
                
              } catch(e) {
                  reject(e);
              }
          });
      });
  }
  async function   uploadImageToStorage(files){
    // console.log("ooooooooooooooooo",files)
    return new Promise((resolve, reject) => {
    
        // console.log(files);
    
        var obj = {
          image: [],
          video: [],
        };
       
          
            obj.image.push({
              originalname: files.originalname,
              new_name: files.originalname,
              location: files.destination,
            });
          console.log(obj);
            // console.log(file)
            let newFileName = `${files.originalname}`;
             console.log(newFileName)
            let fileUpload = bucket.file(newFileName);
             console.log(fileUpload.name)
            const blobStream = fileUpload.createWriteStream({
              resumable : true
            
             
            });
        
            blobStream.on('error', (error) => {
                 console.log(error)
              reject('Something is wrong! Unable to upload at the moment.');
            }).end(files.buffer);
        
            blobStream.on('finish', (abc) => {
              // The public URL can be used to directly access the file via HTTP.
              // console.log("ssssssssssssssssssssssssssssssssssssssssssssss",abc)
              const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
              console.log(url)
              obj.image[0].location = url;
              resolve(obj);
            });
  
            // blobStream.end(files.image[i].buffer);
          
    
      
    
    });
  }
  const shortid = require('shortid');
  const multer = require('multer');
  const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(path.dirname(__dirname),"server/Upload"))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, shortid.generate() + '-' + file.originalname)
    }
  })
  
const upload = multer({ storage: storage1 })
  appServer.post('/bucket',upload.single('categoryImage'), async (req, res) => {
      
    uploadImageToStorage(req.file);

    });
appServer.post('/upload', async (req, res) => {
console.log(req.file);
const data = req.body;
console.log(data);
for await(const urls of data){
  try{
      var val = await parse(urls['Images Link']);
      var zip = new AdmZip(val.body);
      var zipEntries = zip.getEntries();
  
      zip.extractAllTo(/*target path*/ `${__dirname}/Upload`, /*overwrite*/ true);
  }catch(e){  
      console.log(e);
  }
  const dir = `${__dirname}/Upload`;
  const files = fs.readdirSync(dir);
      for (const file of files) {
        folderNames.push({file});
        getAllFiles(`Upload/${file}`);
  }
console.log(folderNames)

}
});
const getAllFiles = async (dirPath, arrayOfFiles) => {
    console.log("Reading Files");
    console.log(dirPath);
    const storageFolderName = dirPath.replace(/(.*\/)*/,"");
    console.log(storageFolderName);
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || []
    files.forEach(async function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        console.log(file);
      } else {
        const userId = uuid();
        arrayOfFiles.push(path.join(file));
        console.log(`${__dirname}/${dirPath}/${path.join(file)}`);
        console.log(path.join(file));
        const tempfile = fs.readFileSync(`${__dirname}/${dirPath}/${path.join(file)}`).toString('base64');
        await bucket.file(`${path.join(file)}`);
      }
    })
  }
appServer.get('/employes', async (req, res) => {
    // const snapsot= await employees.get();

    const emplotSnapshot = await getDocs(employees);
    const employeelist = emplotSnapshot.docs.map(doc => doc.data());
     
    res.status(200).json({"data": employeelist});
});
http.createServer(appServer).listen(3007, function() {
    console.log('Express server listening on port');
});