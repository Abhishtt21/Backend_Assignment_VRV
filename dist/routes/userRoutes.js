"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/me', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['Admin', 'User', 'Moderator']), userController_1.getUser);
exports.default = router;
