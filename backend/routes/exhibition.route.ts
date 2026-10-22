import express from "express";
import { getAllExhibition, createExhibition, deleteExhibition, getExhibitionById, updateExhibition } from "../controllers/exhibition.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/", getAllExhibition); 
router.post("/createExhibition", protectRoute, adminRoute, createExhibition);
router.get("/:id", getExhibitionById);
router.delete("/:id", protectRoute, adminRoute, deleteExhibition);
router.put("/:id", protectRoute, adminRoute, updateExhibition);


export default router;
