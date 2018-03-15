var mongoose = require("mongoose");

// Schema setup
var serviceSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  price: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

module.exports = mongoose.model("Service", serviceSchema);
