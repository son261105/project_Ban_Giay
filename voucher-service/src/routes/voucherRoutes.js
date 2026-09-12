const express = require('express');
const router = express.Router();
const { validateVoucher, useVoucher, getPublicVouchers, getAllVouchers, createVoucher, updateVoucher, toggleVoucher, deleteVoucher } = require('../controllers/voucherController');

router.post('/validate', validateVoucher);
router.post('/use', useVoucher);
router.get('/public', getPublicVouchers);
router.get('/admin', getAllVouchers);
router.post('/admin', createVoucher);
router.put('/admin/:id', updateVoucher);
router.patch('/admin/:id/toggle', toggleVoucher);
router.delete('/admin/:id', deleteVoucher);

module.exports = router;