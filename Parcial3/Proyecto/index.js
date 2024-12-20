const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();

// Verificar existencia de carpetas 'uploads' y 'pdfs'
const uploadFolder = './uploads';
const pdfFolder = './pdfs';

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

if (!fs.existsSync(pdfFolder)) {
    fs.mkdirSync(pdfFolder);
}

// Configuración de Multer para manejar la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, './uploads/')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limitar tamaño del archivo a 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes.'));
        }
    }
});

// Middleware para procesar JSON y datos del formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para manejar el envío del formulario
app.post('/submit', upload.fields([
    { name: 'imagen-foto', maxCount: 1 },
    { name: 'imagen-pokemon', maxCount: 1 },
    { name: 'imagen-juego', maxCount: 1 }
]), async (req, res) => {
    const {
        nombre,
        "apellido-paterno": apellidoPaterno,
        "apellido-materno": apellidoMaterno,
        edad,
        genero,
        "generacion-favorita": generacionFavorita,
        "region-favorita": regionFavorita,
        "tipo-favorito": tipoFavorito,
        "mecanica-favorita": mecanicaFavorita,
        "pokemon-favorito": pokemonFavorito,
        "juego-favorito": juegoFavorito,
        equipo,
        episodio,
        "tiempo-jugando": tiempoJugando,
        interaccion,
        "tema-musica": temaMusica,
        comentarios,
        noticias
    } = req.body;

    const archivos = req.files;

    try {
        // Generar la ruta y el flujo para el PDF
        const pdfName = `${Date.now()}-pokemon-formulario.pdf`;
        const pdfPath = path.join(pdfFolder, pdfName);
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);

        pdfDoc.pipe(writeStream);

        // Contenido del PDF
        pdfDoc.fontSize(20).text('Formulario de Pokémon', { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.fontSize(16).text(`Nombre: ${nombre} ${apellidoPaterno} ${apellidoMaterno}`);
        pdfDoc.text(`Edad: ${edad}`);
        pdfDoc.text(`Género: ${genero}`);
        pdfDoc.text(`Generación Favorita: ${generacionFavorita}`);
        pdfDoc.text(`Región Favorita: ${regionFavorita}`);
        pdfDoc.text(`Tipo Favorito: ${tipoFavorito}`);
        pdfDoc.text(`Mecánica Favorita: ${mecanicaFavorita}`);
        pdfDoc.text(`Pokémon Favorito: ${pokemonFavorito}`);
        pdfDoc.text(`Juego Favorito: ${juegoFavorito}`);
        pdfDoc.text(`Equipo Pokémon: ${equipo}`);
        pdfDoc.text(`Episodio o Película Favorita: ${episodio}`);
        pdfDoc.text(`Tiempo Jugando Pokémon: ${tiempoJugando}`);
        pdfDoc.text(`Interacción Preferida: ${interaccion}`);
        pdfDoc.text(`Tema de Música Favorito: ${temaMusica}`);
        pdfDoc.text(`Comentarios o Sugerencias: ${comentarios}`);
        pdfDoc.text(`¿Es Pokémon el mejor juego de Nintendo?: ${noticias}`);
        pdfDoc.moveDown();

        // Agregar imágenes al PDF
        ['imagen-foto', 'imagen-pokemon', 'imagen-juego'].forEach((key) => {
            if (req.files[key] && req.files[key].length > 0) {
                const filePath = req.files[key][0].path;
                if (fs.existsSync(filePath)) {
                    pdfDoc.moveDown();
                    pdfDoc.text(`Imagen asociada (${key}):`);
                    pdfDoc.image(filePath, {
                        fit: [200, 200],
                        align: 'center',
                        valign: 'center',
                    });
                    pdfDoc.moveDown(2); // Espacio entre imágenes
                }
            }
        });

        pdfDoc.end();

        // Esperar a que el PDF termine de generarse
        writeStream.on('finish', () => {
            res.setHeader('Content-Disposition', 'inline; filename="pokemon-formulario.pdf"'); // Inline para abrir en navegador
            res.setHeader('Content-Type', 'application/pdf');
            res.sendFile(path.resolve(pdfPath)); // Enviar el PDF generado
        });
        

        writeStream.on('error', (err) => {
            console.error('Error al escribir el PDF:', err);
            res.status(500).send('Error al generar el PDF.');
        });

    } catch (error) {
        console.error('Error inesperado:', error);
        res.status(500).send('Error al procesar el formulario.');
    }
});

// Iniciar el servidor
const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

