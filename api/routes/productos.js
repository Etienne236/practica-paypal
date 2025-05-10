const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos (con async/await)
router.get('/', async (req, res) => {
  try {
    const [resultados] = await db.query('SELECT * FROM productos');
    const productosConvertidos = resultados.map(p => ({
      ...p,
      precioP: Number(p.precioP),
      cantidad: Number(p.cantidad)
    }));

    res.json(productosConvertidos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const db = require('../db');

// // Obtener todos los productos
// router.get('/', (req, res) => {
//     db.query('SELECT * FROM productos', (err, resultados) => {
//         if (err) return res.status(500).send(err);
//         res.json(resultados);
//     });
// });

// // Obtener un producto por ID
// router.get('/:id', (req, res) => {
//     const id = req.params.id;
//     db.query('SELECT * FROM productos WHERE id = ?', [id], (err, resultados) => {
//         if (err) return res.status(500).send(err);
//         if (resultados.length === 0) return res.status(404).send('Producto no encontrado');
//         res.json(resultados[0]);
//     });
// });

// // Crear un nuevo producto
// router.post('/', (req, res) => {
//     const { nombre, precioP, cantidad, imagen } = req.body;
//     db.query(
//         'INSERT INTO productos (nombre, precioP, cantidad, imagen) VALUES (?, ?, ?, ?)',
//         [nombre, precioP, cantidad, imagen],
//         (err, resultados) => {
//             if (err) return res.status(500).send(err);
//             res.status(201).json({ id: resultados.insertId, ...req.body });
//         }
//     );
// });

// // Actualizar un producto
// router.put('/:id', (req, res) => {
//     const id = req.params.id;
//     const { nombre, precioP, cantidad, imagen } = req.body;
//     db.query(
//         'UPDATE productos SET nombre = ?, precioP = ?, cantidad = ?, imagen = ? WHERE id = ?',
//         [nombre, precioP, cantidad, imagen, id],
//         (err) => {
//             if (err) return res.status(500).send(err);
//             res.json({ id, ...req.body });
//         }
//     );
// });

// // Eliminar un producto
// router.delete('/:id', (req, res) => {
//     const id = req.params.id;
//     db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
//         if (err) return res.status(500).send(err);
//         res.sendStatus(204);
//     });
// });

// module.exports = router;