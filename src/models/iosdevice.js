const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const iosDeviceSchema = new Schema({
    token: {type: String, unique: true}, 
    lastUpdated: { type: Date, default: Date.now }
});


module.exports = mongoose.model("iosDevice", iosDeviceSchema);