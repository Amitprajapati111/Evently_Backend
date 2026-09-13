import { Router } from "express";
import { createRequirement } from "../controllers/requirementController.js";

const router = Router();

router.post("/", createRequirement);

export default router;
