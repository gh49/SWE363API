const db = require("../db");

const User = db.model("User", {
    email: String,
    password: String,
    username: String,
    cart: [{type: db.Schema.Types.ObjectId, ref: 'Post'}],
});

module.exports = User;