/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express(); 

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

// Shared tool for Jennifer's photo uploads
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

// 1. Set Headers FIRST
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// 2. Then set up Sessions and BodyParser
app.use(session({
  secret: "secretKey",
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(400).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', async function (request, response) {
  try {
    const users = await User.find({});

    const userList = JSON.parse(JSON.stringify(users)).map(function (user) {
      return {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name
      };
    });

    response.status(200).json(userList);
  } catch (err) {
    console.error('Error in /user/list:', err);
    response.status(500).send(JSON.stringify(err));
  }
});

app.get('/user/:id', async function (request, response) {
  const id = request.params.id;

  try {
    const user = await User.findById(id, {
      _id: 1,
      first_name: 1,
      last_name: 1,
      location: 1,
      description: 1,
      occupation: 1
    });

    if (!user) {
      response.status(400).send('User not found');
      return;
    }

    const userObj = JSON.parse(JSON.stringify(user));
    response.status(200).json(userObj);
  } catch (err) {
    console.error('Error in /user/:id:', err);
    response.status(400).send(JSON.stringify(err));
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', async function (request, response) {
  const id = request.params.id;

  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(id);
  } catch (e) {
    response.status(400).send('Invalid user id');
    return;
  }

  try {
    const photos = await Photo.find({ user_id: userObjectId }).lean();

    if (!photos || photos.length === 0) {
      response.status(400).send('No photos found for user');
      return;
    }

    const userIds = [];
    photos.forEach(function (photo) {
      if (photo.comments) {
        photo.comments.forEach(function (comment) {
          if (comment.user_id) {
            userIds.push(comment.user_id.toString());
          }
        });
      }
    });

    const users = await User.find(
      { _id: { $in: userIds } },
      { _id: 1, first_name: 1, last_name: 1 }
    ).lean();

    const userMap = {};
    users.forEach(function (user) {
      userMap[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name
      };
    });

    const result = photos.map(function (photo) {
      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: (photo.comments || []).map(function (comment) {
          return {
            _id: comment._id,
            comment: comment.comment,
            date_time: comment.date_time,
            user: userMap[comment.user_id.toString()]
          };
        })
      };
    });

    response.status(200).json(JSON.parse(JSON.stringify(result)));
  } catch (err) {
    console.error('Error in /photosOfUser/:id:', err);
    response.status(500).send(JSON.stringify(err));
  }
});

const server = app.listen(3001, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});

/* =========================================================
 * SPRINT 3 TEAM REPOSITORY - RESERVED SECTIONS
 * ========================================================= */

/** PBI 6: LOGIN (NICK) - POST /admin/login */
// --- START NICK ---
app.post("/admin/login", async function (request, response) {
  try {
    const login_name = request.body.login_name;
    const password = request.body.password;

    // Validate input
    if (!login_name || !password) {
      response.status(400).send("Missing login_name or password");
      return;
    }

    // Find user
    const user = await User.findOne({ login_name: login_name });

    if (!user || user.password !== password) {
      response.status(400).send("Invalid credentials");
      return;
    }

    // Save user in session
    request.session.user_id = user._id;

    // Return user info (no password!)
    response.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
      login_name: user.login_name,
    });

  } catch (err) {
    console.error("Error in /admin/login:", err);
    response.status(500).send("Server error");
  }
});
// --- END NICK ---


/** PBI 7: REGISTRATION (ANDREW) - POST /user */
// --- START ANDREW ---
app.post("/user", async function (request, response) {
  try {
    const first_name = request.body.first_name || "";
    const last_name = request.body.last_name || "";
    const location = request.body.location || "";
    const description = request.body.description || "";
    const occupation = request.body.occupation || "";
    const login_name = request.body.login_name || "";
    const password = request.body.password || "";

    if (login_name.trim() === "") {
      response.status(400).send("login_name is required");
      return;
    }

    if (first_name.trim() === "") {
      response.status(400).send("first_name is required");
      return;
    }

    if (last_name.trim() === "") {
      response.status(400).send("last_name is required");
      return;
    }

    if (password.trim() === "") {
      response.status(400).send("password is required");
      return;
    }

    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      response.status(400).send("login_name already exists");
      return;
    }

    const newUser = new User({
      first_name: first_name,
      last_name: last_name,
      location: location,
      description: description,
      occupation: occupation,
      login_name: login_name,
      password: password,
    });

    await newUser.save();

    response.status(200).send({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      location: newUser.location,
      description: newUser.description,
      occupation: newUser.occupation,
      login_name: newUser.login_name,
    });
  } catch (err) {
    console.error("Error in /user:", err);
    response.status(500).send("Server error");
  }
});
// --- END ANDREW ---


/** PBI 8: COMMENTS (NATHANIEL) - POST /commentsOfPhoto/:photo_id */

// --- START NATHANIEL ---
app.post('/commentsOfPhoto/:photo_id', async function (request, response) {
  try {
    // 1. Check if user is logged in
    if (!request.session.user_id) {
      response.status(401).send("User not logged in");
      return;
    }

    const photoId = request.params.photo_id;
    const commentText = request.body.comment;

    // 2. Validate input
    if (!commentText || commentText.trim() === "") {
      response.status(400).send("Comment cannot be empty");
      return;
    }

    // 3. Find the photo
    const photo = await Photo.findById(photoId);
    if (!photo) {
      response.status(400).send("Photo not found");
      return;
    }

    // 4. Create comment object
    const newComment = {
      comment: commentText,
      user_id: request.session.user_id,
      date_time: new Date()
    };

    // 5. Add comment to photo
    photo.comments.push(newComment);

    // 6. Save to MongoDB
    await photo.save();

    // 7. Return updated photo (optional but useful)
    response.status(200).json(photo);

  } catch (err) {
    console.error("Error in /commentsOfPhoto/:photo_id:", err);
    response.status(500).send("Server error");
  }
});

// --- END NATHANIEL ---


/** PBI 9: PHOTO UPLOAD (JENNIFER) - POST /photos/new */
// --- START JENNIFER ---
app.post('/photos/new', function (request, response) {
  processFormBody(request, response, async function (err) {
    if (err) {
      console.error("Error processing file:", err);
      response.status(400).send("Error processing file");
      return;
    }

    if (!request.file) {
      response.status(400).send("No file uploaded");
      return;
    }

    try {
      if (!request.session.user_id) {
        response.status(401).send("User not logged in");
        return;
      }

      const userId = request.session.user_id;

      const timestamp = Date.now();
      const originalName = request.file.originalname;
      const extension = originalName.split('.').pop();
      const uniqueName = `photo_${timestamp}.${extension}`;

      const filePath = __dirname + "/images/" + uniqueName;

      fs.writeFile(filePath, request.file.buffer, async function (err) {
        if (err) {
          console.error("Error saving file:", err);
          response.status(500).send("Error saving file");
          return;
        }

        try {
          const newPhoto = await Photo.create({
            file_name: uniqueName,
            date_time: new Date(),
            user_id: userId,
            comments: []
          });

          console.log("Photo uploaded:", uniqueName);

          response.status(200).json(newPhoto);
        } catch (dbErr) {
          console.error("Database error:", dbErr);
          response.status(500).send("Error saving photo to database");
        }
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      response.status(500).send("Server error");
    }
  });
});
// --- END JENNIFER ---

/** PBI 10: LOGOUT (JOSHALIN) - POST /admin/logout */
app.post('/admin/logout', function (request, response) {
    if (!request.session.user_id) {
        return response.status(400).send("No user currently logged in.");
    }

    request.session.destroy(function (err) {
        if (err) {
            console.error("Logout error:", err);
            return response.status(500).send("Logout failed.");
        }
        return response.status(200).send();
    });
});
