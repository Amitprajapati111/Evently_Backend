import Requirement from "../models/Requirement.js";
import { validateRequirement } from "../utils/validateRequirement.js";

export async function createRequirement(req, res, next) {
  try {
    const requirementData = validateRequirement(req.body);
    const requirement = await Requirement.create(requirementData);
    return res.status(201).json({
      success: true,
      message: "Requirement created successfully",
      data: { id: requirement.id },
    });
  } catch (error) {
    return next(error);
  }
}
