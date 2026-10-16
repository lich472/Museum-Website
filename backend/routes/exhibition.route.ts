import express from "express";
import { getAllExhibition, createExhibition, deleteExhibition, getExhibitionById, updateExhibition } from "../controllers/exhibition.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/", getAllExhibition); 
// Mounted where api-contract.md §1 says it is (POST /api/exhibitions) and
// behind the same guards as delete and update. It used to sit at
// POST /createExhibition with NO guard at all, so anyone could create
// exhibitions anonymously — and because the admin UI posts to /exhibitions,
// its writes 404'd and were then reported to the user as success.
router.post("/", protectRoute, adminRoute, createExhibition);
router.get("/:id", getExhibitionById);
router.delete("/:id", protectRoute, adminRoute, deleteExhibition);
router.put("/:id", protectRoute, adminRoute, updateExhibition);


export default router;
