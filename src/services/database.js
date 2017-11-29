/**
 * Persistent data storage service implemnted with MongoDB.
 * @module services/database
 */
const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird');
const Course = require("../models/course");
const Faculty = require("../models/faculty");
const cache = require('memory-cache');

// Schema
// {
//     _id: 'hash(reg_no)',
//     marks: [{
//     class_number: 'string',
//     assessment_title: 'string',
//     scored_marks: 'number',
//     semester: 'string',
//     year: 'string' }]
// }

/**
 * @class CourseCollection
 */
class CourseCollection {
  /**
   * @method insertOrUpdate
   * @param {String} reg_no
   * @param {Object} marksReport
   * @param {Promise<Object>}
   */
  insertOrUpdateMarks(reg_no, marksReports) {
    const updateDb = marksReport => {
      // console.log(marksReport)
      return Course.findOne({
          class_number: marksReport.class_number
        }).exec()
        .then(course => {
          if (course == null) {
            let newCourse = new Course({
              class_number: marksReport["class_number"],
              course_code: marksReport["course_code"],
              course_title: marksReport["course_title"]
            })

            return newCourse.save();
          } else {
            return Promise.resolve(course);
          }
        }).then(course => {
          for (var i = 0; i < marksReport.marks.length; i++) {
            
            if(isNaN(marksReport.marks[i].scored_marks))
              continue;

            let hreg = crypto.createHash('md5')
              .update(`${reg_no}`)
              .digest('hex');
             let id = crypto.createHash('md5')
              .update(`${hreg}_${marksReport.marks[i].title}`)
               .digest('hex');

            var mark = course.marks.id(id);
            if (mark != null) {
              mark.is_present = (marksReport.marks[i].status === "Present");
              mark.scored_marks = marksReport.marks[i].scored_marks;
            } else {
              course.marks.push({
                _id: id,
                is_present: (marksReport.marks[i].status === "Present"),
                scored_marks: marksReport.marks[i].scored_marks,
                marks_type: marksReport.marks[i].title
              })
            }

          }

          return course.save();
        })
    }

    return Promise.all(marksReports.map(updateDb))
  }

  /**
   * @method aggregate
   * @param {String} classNumber
   * @returns {Promise<Object>}
   */
  aggregate(classNumber) {
    let aggregate = cache.get(`marks_${classNumber}`);

    if (aggregate != null)
      return Promise.resolve(aggregate);
    else
      return Course.aggregate([{
          $match: {
            'class_number': String(classNumber)
          }
        },
        {
          $unwind: "$marks"
        },
        {
          $group: {
            _id: '$marks.marks_type',
            average: {
              $avg: '$marks.scored_marks'
            },
            count: {
              $sum: 1
            },
            minimum: {
              $min: '$marks.scored_marks'
            },
            maximum: {
              $max: '$marks.scored_marks'
            },
            standard_deviation: {
              $stdDevPop: '$marks.scored_marks'
            }
          }
        }
      ]).then(result => {
        const aggregate = {};
        for (let i = 0; i < result.length; i++) {
          const key = result[i]._id;
          delete result[i]._id;
          aggregate[key] = result[i];
        }

        cache.put(`marks_${classNumber}`, aggregate, 120 * 1000);

        return aggregate;
      });
  }
}

/**
 * @class FacultyCollection
 * 
 */
class FacultyCollection {

  /**
   * @method insertOrUpdate
   * @param {Object} faculty_details
   * @returns {Promise<Object>} 
   */
  insertOrUpdate(faculty_details){
    return Faculty.findOne({empid: faculty_details["empid"]}).
    then(faculty => {
      if(faculty == null){
        let newFaculty = new Faculty(faculty_details);
        return newFaculty.save();

      }else{
        if(faculty_details.phone != null && faculty.phone == null)
          faculty.phone = faculty_details.phone;
        return faculty.save();
      }
    })  
  }

  /**
   * @method getAll
   * @returns {Promise<Object>}
   */
  getAll(){
    return Faculty.find({});
  }

}


module.exports = {
  CourseCollection,
  FacultyCollection
}
