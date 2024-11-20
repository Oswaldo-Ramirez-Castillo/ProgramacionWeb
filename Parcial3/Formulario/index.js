const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: true}));

app.post('/formulario', (req, res) => {
    console.log(req.body); 
    res.send(`Hola chaval he escuchado tu peticion ${req.body.nombre}` );
});

app.listen(8082, () => {
    console.log('Servidor Express escuchando en puerto 8082');
});