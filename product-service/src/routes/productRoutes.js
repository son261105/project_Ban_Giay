const router = require('express').Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, decreaseStock } = require('../controllers/productController');
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { getSuppliers, createSupplier, getImportReceipts, createImportReceipt, getLowStock, getStockOverview } = require('../controllers/inventoryController');

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', authenticate, isAdmin, createProduct);
router.put('/products/:id', authenticate, isAdmin, updateProduct);
router.delete('/products/:id', authenticate, isAdmin, deleteProduct);
router.post('/products/decrease-stock', decreaseStock); // internal

// Brands
router.get('/brands', getBrands);
router.post('/brands', authenticate, isAdmin, createBrand);
router.put('/brands/:id', authenticate, isAdmin, updateBrand);
router.delete('/brands/:id', authenticate, isAdmin, deleteBrand);

// Categories
router.get('/categories', getCategories);
router.post('/categories', authenticate, isAdmin, createCategory);
router.put('/categories/:id', authenticate, isAdmin, updateCategory);
router.delete('/categories/:id', authenticate, isAdmin, deleteCategory);

// Inventory
router.get('/inventory/suppliers', authenticate, isAdmin, getSuppliers);
router.post('/inventory/suppliers', authenticate, isAdmin, createSupplier);
router.get('/inventory/receipts', authenticate, isAdmin, getImportReceipts);
router.post('/inventory/receipts', authenticate, isAdmin, createImportReceipt);
router.get('/inventory/low-stock', authenticate, isAdmin, getLowStock);
router.get('/inventory/stock-overview', authenticate, isAdmin, getStockOverview);

module.exports = router;
