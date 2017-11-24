const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const marksSchema = new Schema({
    _id: String,
    is_present: Boolean,
    scored_marks: {type: Number, required: true},
    marks_type: {type: String, required: true}
})

const courseSchema = new Schema({
    class_number: {type: String, required: true},
    course_title: String,
    course_code: String,
    marks: [marksSchema]
});


module.exports = mongoose.model("Course", courseSchema);