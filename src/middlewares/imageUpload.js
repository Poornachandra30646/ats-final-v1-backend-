const multer = require("multer");

const storage =
  multer.memoryStorage();

const fileFilter =
  (req, file, cb) => {

    const allowed = [

      "image/png",

      "image/jpeg",

      "image/jpg",

      "image/webp"

    ];

    if (
      allowed.includes(
        file.mimetype
      )
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only image files allowed"
        ),
        false
      );

    }

  };

module.exports =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        3 * 1024 * 1024

    }

  });