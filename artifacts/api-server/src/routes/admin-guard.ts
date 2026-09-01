import type { RequestHandler } from "express";

export const TEMP_ADMIN_HEADER = "x-dev-admin";
export const TEMP_ADMIN_VALUE = "barca-news-local-admin";

/**
 * Temporary Phase 2 access guard.
 * This intentionally only works in development and is not production security.
 * Replace it with Clerk authorization before exposing the admin area publicly.
 */
export const requireDevelopmentAdmin: RequestHandler = (req, res, next) => {
  if (
    process.env.NODE_ENV !== "development" ||
    req.get(TEMP_ADMIN_HEADER) !== TEMP_ADMIN_VALUE
  ) {
    req.log.warn(
      { path: req.path },
      "blocked admin request by temporary development guard",
    );
    return res.status(403).json({
      error: "لوحة الإدارة متاحة مؤقتاً في بيئة التطوير فقط",
    });
  }

  return next();
};