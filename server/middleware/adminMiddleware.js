/**
 * Admin authorization middleware.
 * Must be used AFTER the protect (authMiddleware) middleware.
 * Verifies that the authenticated user has admin privileges.
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Admin privileges required.',
    });
  }
  next();
};
