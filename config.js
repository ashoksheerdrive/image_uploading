
const  { initializeApp } = require('firebase/app');
const  { getFirestore, collection, getDocs ,getFireStorage } = require('firebase/firestore/lite');
const storage = require('firebase/storage');
const firebaseConfig = {
     projectId: 'angular9crud-36adf',
   appId: '1:937342418081:web:7c87db134715e47b84c4e0',
   databaseURL: 'https://angular9crud-36adf-default-rtdb.firebaseio.com',
   storageBucket: 'angular9crud-36adf.appspot.com',
   locationId: 'us-central',
   apiKey: 'AIzaSyD6iaedGg33wZRzqPZ0RAShzitiKdV_X70',
   authDomain: 'angular9crud-36adf.firebaseapp.com',
   messagingSenderId: '937342418081',
   measurementId: 'G-PW64CZM2G0'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get a list of cities from your database

  const employees = collection(db, 'employees');
 
  module.exports=employees;
 