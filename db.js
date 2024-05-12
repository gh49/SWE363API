const db_url = "mongodb+srv://gh49:admin@s201931450.ndbnjvg.mongodb.net/?retryWrites=true&w=majority&appName=s201931450";
const mongoose = require("mongoose")
mongoose.connect(db_url)

module.exports = mongoose