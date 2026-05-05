const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");
const express = require("express");
const app = express();

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

// Multer setup
const processFormBody = multer({ storage: multer.memoryStorage() }).single("uploadedphoto");

// -------------------- MIDDLEWARE --------------------

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({
  secret: "secretKey",
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.json());

// -------------------- MODELS --------------------

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

mongoose.set("strictQuery", false);

mongoose.connect("mongodb://127.0.0.1/project6");

// -------------------- STATIC --------------------

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.send("Simple web server of files from " + __dirname);
});

// -------------------- TEST ROUTES (FIXED) --------------------

app.get("/test/:p1", async function (req, res) {
  console.log("/test called with param1 =", req.params.p1);

  const param = req.params.p1 || "info";

  try {
    if (param === "info") {
      const info = await SchemaInfo.find({});

      if (!info || info.length === 0) {
        return res.status(400).send("Missing SchemaInfo");
      }

      return res.json(info[0]);
    }

    if (param === "counts") {
      const collections = [
        { name: "user", model: User },
        { name: "photo", model: Photo },
        { name: "schemaInfo", model: SchemaInfo }
      ];

      const result = {};

      await Promise.all(
        collections.map(async (col) => {
          result[col.name] = await col.model.countDocuments({});
        })
      );

      return res.json(result);
    }

    res.status(400).send("Bad param " + param);
  } catch (err) {
    console.error("Error in /test:", err);
    res.status(500).send(err);
  }
});

// -------------------- USER ROUTES --------------------

app.get("/user/list", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users.map(u => ({
      _id: u._id,
      first_name: u.first_name,
      last_name: u.last_name
    })));
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(400).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// -------------------- PHOTOS --------------------

app.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).lean();
    res.json(photos);
  } catch (err) {
    res.status(500).send(err);
  }
});

// -------------------- LOGIN --------------------

app.post("/admin/login", async (req, res) => {
  try {
    const user = await User.findOne({ login_name: req.body.login_name });

    if (!user || user.password !== req.body.password) {
      return res.status(400).send("Invalid credentials");
    }

    req.session.user_id = user._id;

    res.json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// -------------------- REGISTER --------------------

app.post("/user", async (req, res) => {
  try {
    const existing = await User.findOne({ login_name: req.body.login_name });
    if (existing) return res.status(400).send("User exists");

    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// -------------------- COMMENTS --------------------

app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  try {
    if (!req.session.user_id) return res.status(401).send("Not logged in");

    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(400).send("Photo not found");

    photo.comments.push({
      comment: req.body.comment,
      user_id: req.session.user_id,
      date_time: new Date()
    });

    await photo.save();

    res.json(photo);
  } catch (err) {
    res.status(500).send(err);
  }
});

// -------------------- PHOTO UPLOAD --------------------

app.post("/photos/new", function (req, res) {
  processFormBody(req, res, async function (err) {
    if (err || !req.file) {
      return res.status(400).send("Upload error");
    }

    if (!req.session.user_id) {
      return res.status(401).send("Not logged in");
    }

    const filename = "photo_" + Date.now() + ".jpg";
    const path = __dirname + "/images/" + filename;

    fs.writeFile(path, req.file.buffer, async function () {
      const photo = await Photo.create({
        file_name: filename,
        user_id: req.session.user_id,
        date_time: new Date(),
        comments: []
      });

      res.json(photo);
    });
  });
});

// -------------------- FAVORITES --------------------

app.post("/favorites/add/:photo_id", async (req, res) => {
  await User.findByIdAndUpdate(req.session.user_id, {
    $addToSet: { favorites: req.params.photo_id }
  });
  res.sendStatus(200);
});

app.post("/favorites/remove/:photo_id", async (req, res) => {
  await User.findByIdAndUpdate(req.session.user_id, {
    $pull: { favorites: req.params.photo_id }
  });
  res.sendStatus(200);
});

app.get("/favorites", async (req, res) => {
  const user = await User.findById(req.session.user_id).populate("favorites");
  res.json(user.favorites);
});

// -------------------- LOGOUT --------------------

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

// -------------------- START SERVER --------------------

app.listen(3001, () => {
  console.log("Listening at http://localhost:3001");
});