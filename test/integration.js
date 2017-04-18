var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Validator = require('jsonschema').Validator;
var moment = require('moment');

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
    console.error(`${fileName} contains invalid JSON.`);
  }
});


// Load test vtop credentials
try {
  var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json'), 'utf-8'));
} catch (ex) {
  console.error('Credentials not found. Please create test/credentials.json with keys (reg_no, password).')
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
              spotlight: { "type": "array", required: true, "items": { "$ref": "/SpotlightItem" } }
            }
          }
          let r = validator.validate(res.body, schema, { nestedErrors: true });
          expect(r.valid).to.be.true;
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

    it('POST student/hostel/[applications|outing]', (done) => {

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

    it('POST student/hostel/[applications|leave]', (done) => {

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
})
