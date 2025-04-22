const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const productController = require('../controllers/productController');
const image = require('../middleware/multerConfig');

router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProduct)

router.post('/', authMiddleware(1995, 1996), image.uploadMultiple, productController.createProduct) // admin + seller
router.put('/:id', authMiddleware(1995, 1996), image.uploadMultiple, productController.updateProduct)
router.delete('/:id', authMiddleware(1995, 1996), productController.deleteProduct) // admin only
router.delete('/delete-image/:productId/:imageName', image.uploadMultiple, authMiddleware(1995, 1996), productController.deleteProductImage)

module.exports = router
