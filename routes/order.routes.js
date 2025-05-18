// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/roles');

router.get('/', authMiddleware(ROLES.ADMIN, ROLES.SELLER), orderController.getOrders);
router.put('/:orderId', authMiddleware(ROLES.ADMIN, ROLES.SELLER), orderController.updateOrderStatus);

router.post('/', authMiddleware(), orderController.createOrder);
router.get('/user', authMiddleware(), orderController.getCurrentUserOrders);
router.get('/:orderId', authMiddleware(), orderController.getOrderById);
router.delete('/:orderId', authMiddleware(), orderController.deleteOrder);

module.exports = router;