import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protect = (req, res, next) => {
  let token;

  // Check for token in the request header (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user to the request object
      req.user = decoded;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token is found
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    return next(); // User is a seller, proceed to the next middleware/route
  } else {
    res.status(403).json({ message: "Not authorized as a seller" });
  }
};
