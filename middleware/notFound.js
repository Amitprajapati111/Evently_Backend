import HttpError from "../utils/HttpError.js";

export default function notFound(req, res, next) {
  next(new HttpError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
