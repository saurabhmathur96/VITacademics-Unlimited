var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Validator = require('jsonschema').Validator;
var moment = require('moment');
var logger = require('winston');

var supertest = require('supertest');
var app = require(path.join(__dirname, '..', 'src', 'app'));
var request = supertest(app);



// Power up the jsonschema validator
var validator = new Validator();

// Read and load each schema file from schemas/
var schemaFiles = fs.readdirSync(path.join(__dirname, '..', 'schemas'));
schemaFiles.forEach((fileName) => {
  try {
    let filePath = path.join(__dirname, '..', 'schemas', fileName);
    let schema = JSON.parse(fs.readFileSync(filePath));
    validator.addSchema(schema);

  } catch (ex) {
    logger.error(`${fileName} contains invalid JSON.`, ex);
  }
});


// Load test vtop credentials
try {
  var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json'), 'utf-8'));
} catch (ex) {
  logger.error('Credentials not found. Please create test/credentials.json with keys (reg_no, password).', ex)
}


describe('Integration Tests', () => {
  if (credentials) {
    it('POST /student/refresh', (done) => {
      request.post('/student/refresh')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;

          let r;

          expect(res.body).to.have.property('attendance');
          r = validator.validate(res.body.attendance, { "type": "array", "items": { "$ref": "/Attendance" } }, { nestedErrors: true });
          expect(r.valid).to.be.true;
          expect(res.body.attendance.length).to.be.above(0);

          expect(res.body).to.have.property('timetable');
          r = validator.validate(res.body.timetable, { "type": "array", "items": { "$ref": "/DailySchedule" } }, { nestedErrors: true });
          expect(r.valid).to.be.true;
          expect(res.body.timetable.length).to.be.above(0);

          expect(res.body).to.have.property('exam_schedule');
          let exams = ['CAT - I', 'CAT - II', 'Final Assessment Test'];
          for (let i = 0; i < exams.length; i++) {
            expect(res.body.exam_schedule).to.have.property(exams[i]);
            r = validator.validate(res.body.exam_schedule[exams[i]], { "type": "array", "items": { "$ref": "/ExamSchedule" } }, { nestedErrors: true });
            expect(r.valid).to.be.true;
            expect(res.body.exam_schedule[exams[i]].length).to.be.above(0);
          }

          expect(res.body).to.have.property('marks');
          r = validator.validate(res.body.marks, { "type": "array", "items": { "$ref": "/Marks" } }, { nestedErrors: true });
          expect(r.valid).to.be.true;
          expect(res.body.marks.length).to.be.above(0);

          expect(res.body).to.have.property('semester');

          expect(res.body).to.have.property('default_semester');

          done();
        });
    });


    it('POST /student/refresh semester=FS', (done) => {
      request.post('/student/refresh')
        .send({ reg_no: credentials.reg_no, password: credentials.password, semester: 'FS' })
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let r;

          expect(res.body).to.have.property('timetable');
          r = validator.validate(res.body.timetable, { "type": "array", "items": { "$ref": "/DailySchedule" } }, { nestedErrors: true });
          expect(r.valid).to.be.true;
          expect(res.body.timetable.length).to.be.above(0);



          expect(res.body).to.have.property('semester');

          expect(res.body).to.have.property('default_semester');

          done();
        });
    });

    it('POST /student/home', (done) => {
      request.post('/student/home')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let schema = {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              messages: { "type": "array", required: true, "items": { "$ref": "/FacultyMessage" } },
              spotlight: { "type": "array", required: true, "items": { "$ref": "/SpotlightItem" } },
              cookies: { "type": "array", required: true, "items": { "type": "string" } }
            }
          }
          let r = validator.validate(res.body, schema, { nestedErrors: true });
          expect(r.valid).to.be.true;
          done();
        });
    });

    //alter however
    xit('POST /student/coursepage', (done) => {
      request.post('/student/coursepage')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let r = validator.validate(res.body.details, {"$ref": "/CoursePage"});
          expect(r.valid).to.be.true
          done();
        });
    });

    it('POST /student/grades', (done) => {
      request.post('/student/grades')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let r = validator.validate(res.body, { "$ref": "/Grades" });
          expect(r.valid).to.be.true
          done();
        });
    });

    xit('POST student/hostel/[applications|outing]', (done) => {

      request.post('/student/hostel/applications')
        .send(credentials)
        .expect(200)
        .end((err1, res1) => {
          expect(err1).to.not.exist;
          let schema = {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "applications": { "type": "array", "items": { "$ref": "/HostelApplication" } },
              "authorities": { "type": "array", "items": { "$ref": "/ApprovingAuthority", "minItems": 1 } }
            }
          }
          let r = validator.validate(res1.body, schema, { nestedErrors: true });
          expect(r.valid).to.be.true

          const from = moment().hours(38);
          const to = moment().hours(41);
          request.post('/student/hostel/outing')
            .send({
              reg_no: credentials.reg_no,
              password: credentials.password,
              authority: res1.body.authorities[0].id,
              place: 'test',
              reason: 'test',
              from: from.toISOString(),
              to: to.toISOString()
            })
            .expect(200)
            .end((err2, res2) => {
              expect(err2).to.not.exist;
              r = validator.validate(res2.body, schema, { nestedErrors: true });
              expect(r.valid).to.be.true;

              var index = res2.body.applications.map((e) => e.from).indexOf(from.format('DD-MMM-YYYY').toUpperCase());
              if (index === -1) {
                throw new Error('Outing application not found !');
              }
              request.post('/student/hostel/cancel')
                .send({
                  reg_no: credentials.reg_no,
                  password: credentials.password,
                  application_id: res2.body.applications[index].application_id
                })
                .expect(200)
                .end((err3, res3) => {
                  expect(err3).to.not.exist;

                  r = validator.validate(res3.body, schema, { nestedErrors: true });
                  expect(r.valid).to.be.true;

                  done();
                });
            });
        });
    });

    xit('POST student/hostel/[applications|leave]', (done) => {

      request.post('/student/hostel/applications')
        .send(credentials)
        .expect(200)
        .end((err1, res1) => {
          expect(err1).to.not.exist;
          let schema = {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "applications": { "type": "array", "items": { "$ref": "/HostelApplication" } },
              "authorities": { "type": "array", "items": { "$ref": "/ApprovingAuthority", "minItems": 1 } }
            }
          }
          let r = validator.validate(res1.body, schema, { nestedErrors: true });
          expect(r.valid).to.be.true

          const from = moment().hours(38).add(60 * 60 * 1000 * 24);
          const to = moment().hours(41).add(60 * 60 * 1000 * 24 * 3);
          request.post('/student/hostel/leave')
            .send({
              reg_no: credentials.reg_no,
              password: credentials.password,
              authority: res1.body.authorities[0].id,
              place: 'test',
              reason: 'test',
              from: from.toISOString(),
              to: to.toISOString(),
              type: 'HT'
            })
            .expect(200)
            .end((err2, res2) => {
              expect(err2).to.not.exist;
              r = validator.validate(res2.body, schema, { nestedErrors: true });
              expect(r.valid).to.be.true;

              var index = res2.body.applications.map((e) => e.from).indexOf(from.format('DD-MMM-YYYY').toUpperCase());
              if (index === -1) {
                throw new Error('Outing application not found !');
              }
              request.post('/student/hostel/cancel')
                .send({
                  reg_no: credentials.reg_no,
                  password: credentials.password,
                  application_id: res2.body.applications[index].application_id
                })
                .expect(200)
                .end((err3, res3) => {
                  expect(err3).to.not.exist;
                  r = validator.validate(res3.body, schema, { nestedErrors: true });
                  expect(r.valid).to.be.true;

                  done();
                });
            });
        });
    });

    xit('POST student/late/appplications', (done) => {

      request.post('/student/late/applications')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let schema = {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "applications": { "type": "array", "items": { "$ref": "/LateHoursApplication" } }
            }
          };
          let r = validator.validate(res.body, schema, { nestedErrors: true });
          expect(r.valid).to.be.true
          done();
        });
    });

    xit('POST student/late/apply', (done) => {

      const from = moment().hours(38).add(60 * 60 * 1000 * 24);
      const to = moment().hours(41).add(60 * 60 * 1000 * 24 * 3);

      request.post('/student/late/apply')
        .send({
          reg_no: credentials.reg_no,
          password: credentials.password,
          faculty_id: '11061',
          school: 'SITE',
          place: 'test',
          reason: 'test',
          from_date: from.toISOString(),
          to_date: to.toISOString(),
          from_time: '08:00 PM',
          to_time: '12:00 AM'
        })
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let schema = {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "applications": { "type": "array", "items": { "$ref": "/LateHoursApplication" } }
            }
          };
          let r = validator.validate(res.body, schema, { nestedErrors: true });
          expect(r.valid).to.be.true

          var index = res.body.applications.map((e) => e.from).indexOf(from.format('DD-MMM-YYYY').toUpperCase());
          if (index === -1) {
            throw new Error('Late application not found !');
          }

          expect(res.body.applications[index].cancel_id).to.be.not.null;
          request.post('/student/late/cancel')
            .send({
              reg_no: credentials.reg_no,
              password: credentials.password,
              cancel_id: res.body.applications[index].cancel_id
            })
            .expect(200)
            .end((error, response) => {
              expect(error).to.not.exist;
              r = validator.validate(response.body, schema, { nestedErrors: true });
              expect(r.valid).to.be.true;

              done();
            });
        });
    });

    it('POST student/assignments', (done) => {

      request.post('/student/assignments')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.have.property('courses');
          let r = validator.validate(res.body.courses, { "type": "array", "items": { "$ref": "/AssignmentBetaCourse" } }, { nestedErrors: true });
          expect(r.valid).to.be.true;
          done();
        });
    });
  }


  it('GET /faculty/all', (done) => {
    request.get('/faculty/all')
      .expect(200)
      .end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.have.property('faculty');
        let r = validator.validate(res.body.faculty, { "type": "array", "items": { "$ref": "/Faculty" } }, { nestedErrors: true });
        expect(r.valid).to.be.true;
        done();
      });
  });

  it('GET /faculty/late', (done) => {
    request.get('/faculty/late')
      .expect(200)
      .end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.have.property('schools');
        let r = validator.validate(res.body.faculty, { "type": "array", "items": { "$ref": "/LateHoursSchool" } }, { nestedErrors: true });
        expect(r.valid).to.be.true;
        done();
      });
  });
})
