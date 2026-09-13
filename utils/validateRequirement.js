import HttpError from "./HttpError.js";

const EVENT_TYPES = ["Corporate Event", "Wedding", "College Fest", "Concert", "Birthday Party", "Private Party", "Conference", "Exhibition", "Other"];
const PLANNING_TYPES = ["Full Event Planning", "Partial Planning", "Day-of Coordination"];
const PLANNER_SERVICES = ["Event Coordination", "Decoration", "Catering Management", "Guest Management", "Vendor Management", "Logistics", "Stage Management"];
const PERFORMER_TYPES = ["Singer", "DJ", "Band", "Dancer", "Comedian", "Anchor", "Magician", "Other"];
const TECHNICAL_REQUIREMENTS = ["Microphone", "Speakers", "DJ Console", "Stage", "Lighting", "Sound System", "Backstage Area"];
const CREW_TYPES = ["Photographer", "Videographer", "Sound Technician", "Lighting Technician", "Security", "Event Staff", "Stage Crew", "Other"];
const EQUIPMENT = ["Professional Camera", "Video Camera", "Lighting Equipment", "Audio Equipment", "Tripod", "Drone", "Other"];

function requiredString(value, label, maxLength = Infinity) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(`${label} is required.`);
  const cleaned = value.trim();
  if (cleaned.length > maxLength) throw new HttpError(`${label} must be ${maxLength} characters or fewer.`);
  return cleaned;
}

function optionalString(value, label, maxLength = Infinity) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") throw new HttpError(`${label} must be text.`);
  const cleaned = value.trim();
  if (cleaned.length > maxLength) throw new HttpError(`${label} must be ${maxLength} characters or fewer.`);
  return cleaned;
}

function allowedValue(value, allowed, label) {
  if (!allowed.includes(value)) throw new HttpError(`Please select a valid ${label}.`);
  return value;
}

function dateFromInput(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(`${label} is required and must be a valid date.`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new HttpError(`${label} is required and must be a valid date.`);
  return date;
}

function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new HttpError(`${label} must be greater than 0.`);
  return number;
}

function optionalNonNegativeNumber(value, label) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new HttpError(`${label} cannot be negative.`);
  return number;
}

function allowedArray(value, allowed, label, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new HttpError(`Select at least one ${label}.`);
    return [];
  }
  if (!Array.isArray(value)) throw new HttpError(`${label} must be a list.`);
  if (required && value.length === 0) throw new HttpError(`Select at least one ${label}.`);
  if (value.some((item) => !allowed.includes(item))) throw new HttpError(`One or more ${label} are invalid.`);
  return [...new Set(value)];
}

function plannerDetails(details) {
  const planningType = allowedValue(details.planningType, PLANNING_TYPES, "planning type");
  return {
    planningType,
    guestCount: positiveNumber(details.guestCount, "Expected guest count"),
    ...(optionalNonNegativeNumber(details.budget, "Budget") !== undefined && { budget: optionalNonNegativeNumber(details.budget, "Budget") }),
    services: allowedArray(details.services, PLANNER_SERVICES, "service", true),
    additionalRequirements: optionalString(details.additionalRequirements, "Additional requirements", 1000),
  };
}

function performerDetails(details) {
  const budgetMin = optionalNonNegativeNumber(details.budgetMin, "Minimum budget");
  const budgetMax = optionalNonNegativeNumber(details.budgetMax, "Maximum budget");
  if (budgetMin !== undefined && budgetMax !== undefined && budgetMax < budgetMin) throw new HttpError("Maximum budget cannot be lower than minimum budget.");
  return {
    performerType: allowedValue(details.performerType, PERFORMER_TYPES, "performer type"),
    numberOfPerformers: positiveNumber(details.numberOfPerformers, "Number of performers"),
    performanceDuration: positiveNumber(details.performanceDuration, "Performance duration"),
    genre: optionalString(details.genre, "Genre / style", 100),
    ...(budgetMin !== undefined && { budgetMin }),
    ...(budgetMax !== undefined && { budgetMax }),
    technicalRequirements: allowedArray(details.technicalRequirements, TECHNICAL_REQUIREMENTS, "technical requirement"),
    additionalRequirements: optionalString(details.additionalRequirements, "Additional requirements", 1000),
  };
}

function crewDetails(details) {
  const startTime = requiredString(details.startTime, "Start time", 5);
  const endTime = requiredString(details.endTime, "End time", 5);
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!validTime.test(startTime) || !validTime.test(endTime) || endTime <= startTime) {
    throw new HttpError("End time must be after the start time.");
  }
  return {
    crewTypes: allowedArray(details.crewTypes, CREW_TYPES, "crew type", true),
    numberOfCrewMembers: positiveNumber(details.numberOfCrewMembers, "Number of crew members"),
    startTime,
    endTime,
    equipmentRequired: allowedArray(details.equipmentRequired, EQUIPMENT, "equipment item"),
    additionalRequirements: optionalString(details.additionalRequirements, "Additional requirements", 1000),
  };
}

export function validateRequirement(body = {}) {
  const eventName = requiredString(body.eventName, "Event name", 100);
  if (eventName.length < 3) throw new HttpError("Event name must be at least 3 characters.");
  const startDate = dateFromInput(body.startDate, "Start date");
  const endDate = dateFromInput(body.endDate, "End date");
  if (endDate < startDate) throw new HttpError("End date cannot be before the start date.");
  const category = allowedValue(body.category, ["planner", "performer", "crew"], "requirement category");
  if (!body.categoryDetails || typeof body.categoryDetails !== "object" || Array.isArray(body.categoryDetails)) {
    throw new HttpError("Category details are required.");
  }
  const categoryDetails = category === "planner"
    ? plannerDetails(body.categoryDetails)
    : category === "performer"
      ? performerDetails(body.categoryDetails)
      : crewDetails(body.categoryDetails);

  return {
    eventName,
    eventType: allowedValue(body.eventType, EVENT_TYPES, "event type"),
    startDate,
    endDate,
    location: requiredString(body.location, "Location", 150),
    venue: optionalString(body.venue, "Venue", 150),
    category,
    categoryDetails,
  };
}
