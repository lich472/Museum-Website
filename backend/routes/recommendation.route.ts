import express from "express";
import { getRecommendations } from "../controllers/recommendation.controller.ts";

const router = express.Router();

router.get("/", getRecommendations);

export default router;
