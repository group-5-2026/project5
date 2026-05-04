const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a User.
 */
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,

  //  Needed for login (you already use these in webServer.js)
  login_name: String,
  password: String,

  //  Favorites feature (you already added this correctly)
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Photo",
  }],
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
