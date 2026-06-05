const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {

    console.log("Authorization Header:");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("Extracted Token:");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded User:");

    req.user = decoded;

    next();

  } catch (error) {

    console.log("JWT Error:");
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }
};

module.exports = authMiddleware;