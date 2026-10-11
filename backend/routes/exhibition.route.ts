import express from "express";
import { getAllExhibition, createExhibition, deleteExhibition, getExhibitionById } from "../controllers/exhibition.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/", getAllExhibition); 
router.post("/createExhibition", createExhibition);
router.get("/:id", getExhibitionById);
router.delete("/:id", protectRoute, adminRoute, deleteExhibition);

export default router;
