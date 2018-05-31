const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facultySchema = new Schema({
    empid: {type: Number, unique: true}, 
    division: String, 
    school: String, 
    name: String, 
    designation: String, 
    open_hours: [{
        start_time: String,
        day: String,
        end_time: String
    }], 
    intercom: String, 
    email: String, 
    room: String,
    phone: String
},{ usePushEach: true });


module.exports = mongoose.model("Faculty", facultySchema);
