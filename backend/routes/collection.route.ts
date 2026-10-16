import express from "express";
import { getAllCollections, createCollection, deleteCollection, getCollectionById, updateCollection } from "../controllers/collection.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/", getAllCollections);
router.post("/", protectRoute, adminRoute, createCollection);
router.get("/:id", getCollectionById);
router.delete("/:id", protectRoute, adminRoute, deleteCollection);
router.put("/:id", protectRoute, adminRoute, updateCollection);

export default router;
