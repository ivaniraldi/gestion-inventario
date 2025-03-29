const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const movementController = require("../controllers/movementController");
const analyticsController = require("../controllers/analyticsController");
const userController = require("../controllers/userController");
const settingsController = require("../controllers/settingsController");
const cashClosingController = require("../controllers/cashClosingController");

//Todas las rutas comenzan con /api

// Rutas de autenticación (sin autenticación requerida)
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(authMiddleware);

// Rutas de productos
router.get("/products", productController.list);
router.get("/categorias", productController.listCategories);
router.post("/products", productController.create);
router.put("/products/:id", productController.update);
router.delete("/products/:id", productController.delete);

// Rutas de movimientos
router.get("/movements", movementController.list);
router.post("/movements", movementController.create);

// Rutas de análisis
router.get("/analytics/summary", analyticsController.summary);
router.get("/analytics/movements", analyticsController.movements);

// Rutas de usuarios
router.get("/users", userController.list);
router.post("/users", userController.create);
router.put("/users/:id", userController.update);
// Nota: No hay DELETE implementado en userController.js, considerar si es necesario

// Rutas de configuraciones
router.get("/settings", settingsController.get);
router.put("/settings", settingsController.update);

// Rutas de cierre de caja
router.post("/cash-closing", cashClosingController.create);
router.get("/cash-closing", cashClosingController.list);

// Rutas de eliminación de cierre de caja
router.delete("/cash-closing/:id", cashClosingController.del);

module.exports = router;