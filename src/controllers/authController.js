const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const {
  sendEmail
} = require("../services/emailService");

const s3 =
  require("../config/s3");

const {
  PutObjectCommand
} = require("@aws-sdk/client-s3");


const googleClient =
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  );

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

const getSafeUser = (user) => {
  return {
    id: user._id,

    name: user.name,

    email: user.email,

    profileImage:
      user.profileImage || "",

    phone:
      user.phone || "",

    location:
      user.location || "",

    bio:
      user.bio || "",

    role:
      user.role,

    isVerified:
      user.isVerified,

    createdAt:
      user.createdAt,

    updatedAt:
      user.updatedAt
  };
};

const signup = async (req, res) => {
  try {

    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required"
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase()
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email:
          email.toLowerCase(),
        password:
          hashedPassword
      });

    const token =
      generateToken(user);

    try {

      await sendEmail(
        user.email,
        "Welcome to ATS Checker 🎉",
        `
        <div style="font-family:Arial,sans-serif">

          <h2>
            Welcome to ATS Checker 🚀
          </h2>

          <p>
            Hi ${user.name},
          </p>

          <p>
            Your account has been created successfully.
          </p>

          <p>
            You can now:
          </p>

          <ul>
            <li>Upload resumes</li>
            <li>Analyze ATS scores</li>
            <li>Track resume history</li>
            <li>View ATS reports</li>
          </ul>

          <p>
            Thank you for joining ATS Checker.
          </p>

          <p>
            Happy Job Hunting!
          </p>

          <br/>

          <strong>
            ATS Checker Team
          </strong>

        </div>
        `
      );

    } catch (emailError) {

      console.error(
        "Welcome Email Error:",
        emailError
      );

    }

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      token,
      user:
        getSafeUser(user)
    });

  } catch (error) {

    console.error(
      "Signup Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });

  }
};

const login = async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required"
      });
    }

    const user =
      await User.findOne({
        email:
          email.toLowerCase()
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,
      message:
        "Login successful",
      token,
      user:
        getSafeUser(user)
    });

  } catch (error) {

    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });

  }
};

const getCurrentUser = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    console.error(
      "Get User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });

  }
};

const forgotPassword = async (
  req,
  res
) => {
  try {

    const { email } =
      req.body;

    const user =
      await User.findOne({
        email:
          email.toLowerCase()
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found"
      });
    }

    const resetToken =
      crypto.randomBytes(32)
        .toString("hex");

    user.resetPasswordToken =
      resetToken;

    user.resetPasswordExpires =
      Date.now() +
      15 * 60 * 1000;

    await user.save();

    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Your ATS Password",
      `
      <h2>Password Reset Request</h2>

      <p>
      Click the button below to reset your password.
      </p>

      <a
        href="${resetUrl}"
        style="
          background:#2563eb;
          color:white;
          padding:10px 20px;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Reset Password
      </a>

      <p>
      This link expires in 15 minutes.
      </p>
      `
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset email sent"
    });

  } catch (error) {

    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};

const resetPassword = async (
  req,
  res
) => {
  try {

    const {
      token,
      password
    } = req.body;

    const user =
      await User.findOne({
        resetPasswordToken:
          token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    user.password =
      hashedPassword;

    user.resetPasswordToken =
      null;

    user.resetPasswordExpires =
      null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful"
    });

  } catch (error) {

    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};

const updateProfile =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });

      }

      const {
        name,
        phone,
        location,
        bio
      } = req.body;

      user.name =
        name ?? user.name;

      user.phone =
        phone ?? user.phone;

      user.location =
        location ?? user.location;

      user.bio =
        bio ?? user.bio;

      await user.save();

      return res.status(200).json({

        success: true,

        message:
          "Profile updated successfully",

        user:
          getSafeUser(user)

      });

    } catch (error) {

      console.error(
        "Update Profile Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };

const uploadProfileImage =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found"

        });

      }

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please upload an image"

        });

      }

      const fileName =

        `profile-images/${Date.now()}-${req.file.originalname}`;

      await s3.send(

        new PutObjectCommand({

          Bucket:
            process.env.AWS_BUCKET_NAME,

          Key:
            fileName,

          Body:
            req.file.buffer,

          ContentType:
            req.file.mimetype

        })

      );

      const imageUrl =

        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      user.profileImage =
        imageUrl;

      await user.save();

      return res.status(200).json({

        success: true,

        message:
          "Profile image uploaded successfully",

        profileImage:
          imageUrl,

        user:
          getSafeUser(user)

      });

    } catch (error) {

      console.error(
        "Profile Upload Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };


const googleLogin =
  async (req, res) => {

    try {

      const { token } =
        req.body;

      if (!token) {

        return res.status(400).json({
          success: false,
          message:
            "Google token required"
        });

      }

      const ticket =
        await googleClient.verifyIdToken({
          idToken: token,
          audience:
            process.env.GOOGLE_CLIENT_ID
        });

      const payload =
        ticket.getPayload();

      const {
        sub,
        email,
        name
      } = payload;

      let user =
        await User.findOne({
          email
        });

      if (!user) {

        user =
          await User.create({
            name,
            email,
            googleId: sub,
            isVerified: true
          });

        try {

          await sendEmail(
            email,
            "Welcome to ATS Checker 🎉",
            `
            <h2>
              Welcome to ATS Checker 🚀
            </h2>

            <p>
              Your account was created using Google Login.
            </p>
            `
          );

        } catch (err) {

          console.error(
            "Welcome Email Error:",
            err
          );

        }

      }

      const jwtToken =
        generateToken(user);

      return res.status(200).json({
        success: true,
        message:
          "Google login successful",
        token:
          jwtToken,
        user:
          getSafeUser(user)
      });

    } catch (error) {

      console.error(
        "Google Login Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Google authentication failed"
      });

    }

  };

module.exports = {

  signup,

  login,

  googleLogin,

  getCurrentUser,

  updateProfile,

  uploadProfileImage,

  forgotPassword,

  resetPassword

};