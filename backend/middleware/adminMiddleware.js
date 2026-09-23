export const adminMiddleware = (
  req,
  res,
  next
) => {
  try {
    // Make sure authentication middleware
    // has already attached the user.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Only users with the admin role
    // can access admin routes.
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // User is authenticated and is an admin.
    next();
  } catch (error) {
    console.error(
      "Admin middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Admin authorization failed",
    });
  }
};