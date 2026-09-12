const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getCart, addToCart, updateCart, removeFromCart, clearCart, getCartInternal, clearCartInternal } = require('../controllers/cartController');

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.put('/:id', authenticate, updateCart);
router.delete('/clear', authenticate, clearCart);
router.delete('/:id', authenticate, removeFromCart);
// Internal routes (called by order-service via gateway)
router.get('/internal/:userId', getCartInternal);
router.delete('/internal/:userId/clear', clearCartInternal);

module.exports = router;
