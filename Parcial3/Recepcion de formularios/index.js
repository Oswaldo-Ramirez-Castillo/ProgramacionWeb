const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const app = express();

const folder = path.join(__dirname+'/archivos/'); 
const upload = multer({dest:folder}); 

app.use(express.json());
app.use(express.text());
app.use(upload.single('archivo')); 
app.use(cors());

app.post('/formulario', (req, res) => {
    console.log(req.body);
    res.send(`Hola ${req.body.Nombre}`);
});

app.listen(8082,() => {
    console.log('Servidor escuchando en el puerto 8082');
});