import express from "express";
import { login, logout, signup,deleteUser, refreshToken, getProfile } from "../controllers/auth.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.delete("/:id", protectRoute,adminRoute, deleteUser);

export default router;
