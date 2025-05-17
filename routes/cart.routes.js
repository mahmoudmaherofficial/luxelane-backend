const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware'); // Assuming you have authentication middleware

// Routes for cart operations
router.post('/add', authMiddleware(), cartController.addToCart);
router.get('/', authMiddleware(), cartController.getCart);
router.put('/update', authMiddleware(), cartController.updateCartItem);
router.delete('/remove', authMiddleware(), cartController.removeFromCart);
router.delete('/clear', authMiddleware(), cartController.clearCart);

module.exports = router;