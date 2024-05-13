const db = require("../db");

const User = db.model("User", {
    email: String,
    password: String,
    username: String,
    rating: [Number],
    userLocation: String,
    cart: [{type: db.Schema.Types.ObjectId, ref: 'Post'}],
});

module.exports = User;