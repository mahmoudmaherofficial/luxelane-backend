const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProduct)

router.post('/', authMiddleware(1995, 1996), upload.uploadMultiple, productController.createProduct) // admin + seller
router.put('/:id', authMiddleware(1995, 1996), productController.updateProduct)
router.delete('/:id', authMiddleware(1995, 1996), productController.deleteProduct) // admin only

module.exports = router
