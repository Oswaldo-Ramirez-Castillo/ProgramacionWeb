const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware para habilitar CORS
app.use(cors());

// Middlewares para parsear el cuerpo de la solicitud
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para manejo de archivos
const storage = multer.memoryStorage(); // Guardar archivo en memoria para simplificar
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Archivo permitido
        } else {
            cb(new Error('El archivo debe ser una imagen PNG o JPG.'));
        }
    }
});

// Validaciones con express-validator
const validarFormulario = [
    body('nombre')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres.')
        .trim()
        .escape(),
    body('email')
        .notEmpty()
        .withMessage('El correo electrónico es obligatorio.')
        .isEmail()
        .withMessage('Debe ser un correo válido.')
        .trim()
        .normalizeEmail(),    
];

// Ruta para manejar el formulario
app.post('/formulario', upload.single('archivo'), validarFormulario, (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const { nombre, email } = req.body;
    const archivoSubido = req.file; // Archivo cargado en memoria

    try {
        const doc = new PDFDocument();
        let buffers = [];

        // Escuchar datos generados
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=usuario.pdf');
            res.send(pdfBuffer); // Enviar PDF al navegador
        });

        // Contenido del PDF
        doc.fontSize(20).text('Hola aqui esta tu informacion', { align: 'center' });

        doc.moveDown();
        doc.fontSize(14);
        doc.text(`Nombre: ${nombre}`);
        doc.text(`Email: ${email}`);

        if (archivoSubido) {
            doc.moveDown();
            doc.text('Imagen', { underline: true });
            const imgBuffer = archivoSubido.buffer;
            doc.image(imgBuffer, {
                fit: [300, 300],
                align: 'center',
            });
        }

        doc.end(); // Finalizar generación del PDF
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF.');
    }
});

// Iniciar el servidor
app.listen(8081, () => {
    console.log('Servidor Express escuchando en el puerto 8081');
});
