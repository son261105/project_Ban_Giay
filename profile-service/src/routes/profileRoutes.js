const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getProfile, updateProfile, getNameByUserId } = require('../controllers/profileController');
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.get('/name/:userId', getNameByUserId); // internal call from gateway
module.exports = router;
