const db = require("../db");

const Post = db.model("Post", {
    title: String,
    description: String,
    code: String,
    price: Number,
    quantity: Number,
    photoUrls: [String],
    name: String,
    age: Number,
    gender: String,
    height: Number,
    species: String,
    type: String,
    mutation: String,
    weight: Number,
    tame: String,
    clipped: String,
    breedingLocation: String,
    comments: [{
        username: String,
        addedAt: { type: Date, default: Date.now },
        text: String
    }]
});

module.exports = Post;