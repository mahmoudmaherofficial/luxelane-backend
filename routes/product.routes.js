const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const productController = require('../controllers/product.controller');
const image = require('../middleware/multerConfig');
const { ROLES } = require('../utils/roles');

router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProduct)

router.post('/', authMiddleware(ROLES.ADMIN,ROLES.SELLER), image.uploadMultiple, productController.createProduct) // admin + seller
router.put('/:id', authMiddleware(ROLES.ADMIN,ROLES.SELLER), image.uploadMultiple, productController.updateProduct)
router.delete('/:id', authMiddleware(ROLES.ADMIN,ROLES.SELLER), productController.deleteProduct) // admin only
router.delete('/delete-image/:productId/:imageName', image.uploadMultiple, authMiddleware(ROLES.ADMIN,ROLES.SELLER), productController.deleteProductImage)

module.exports = router
