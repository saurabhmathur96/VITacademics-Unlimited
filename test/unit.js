var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');
var Validator = require('jsonschema').Validator;

var home = require(path.join(__dirname, '..', 'src', 'scrapers', 'home'));
var attendance = require(path.join(__dirname, '..', 'src', 'scrapers', 'attendance'));
var schedule = require(path.join(__dirname, '..', 'src', 'scrapers', 'schedule'));
var academic = require(path.join(__dirname, '..', 'src', 'scrapers', 'academic'));
var hostel = require(path.join(__dirname, '..', 'src', 'scrapers', 'hostel'));

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

describe('Unit Tests', () => {

  it('scrape attendance report', (done) => {
    let filePath = path.join('test', 'data', 'attn_report.html');
    let html = fs.readFileSync(filePath, 'utf8');
    let task = attendance.parseReport(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      let r = validator.validate(result, { "type": "array", "items": { "$ref": "/AttendanceReport" } }, { nestedErrors: true });
      expect(r.valid).to.be.true;
      done();
    }).catch(err => { throw err; })
  });
  it('scrape attendance details', (done) => {
    let filePath = path.join('test', 'data', 'attn_report_details.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = attendance.parseDetails(html);
    expect(task).to.be.instanceof(Promise);

    task.then(result => {
      let r = validator.validate(result, { "type": "array", "items": { "$ref": "/AttendanceDetail" } }, { nestedErrors: true });
      expect(r.valid).to.be.true;
      done();
    }).catch(err => { throw err; })
  });

  it('scrape grades', (done) => {
    let filePath = path.join('test', 'data', 'student_history.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = academic.parseHistory(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      let r = validator.validate(result, { "$ref": "/Grades" });
      expect(r.valid).to.be.true;
      done();
    }).catch(err => { throw err; })
  });

  it('scrape marks', (done) => {
    let filePath = path.join('test', 'data', 'marks.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = academic.parseMarks(html);
    expect(task).to.be.instanceOf(Promise);
    task.then(result => {
      let r = validator.validate(result, { "type": "array", "items": { "$ref": "/Marks" } }, { nestedErrors: true });
      expect(r.valid).to.be.true;
      done();
    }).catch(err => { throw err; })
  });

  it('scrape timetable', (done) => {
    let filePath = path.join('test', 'data', 'course_regular.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = schedule.parseDaily(html, 'vellore');
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      let r = validator.validate(result, { "type": "array", "items": { "$ref": "/DailySchedule" } }, { nestedErrors: true });
      expect(r.valid).to.be.true;
      done();
    }).catch(err => { throw err; })
  });

  it('scrape exam schedule', (done) => {
    let filePath = path.join('test', 'data', 'exam_schedule.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = schedule.parseExam(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      let exams = ['CAT - I', 'CAT - II', 'Final Assessment Test'];
      for (let i = 0; i < exams.length; i++) {
        expect(result).to.have.property(exams[i]);
        let r = validator.validate(result[exams[i]], { "type": "array", "items": { "$ref": "/ExamSchedule" } }, { nestedErrors: true });
        expect(r.valid).to.be.true;
      }

      done();
    }).catch(err => { throw err; })
  });

  it('scrape spotlight', (done) => {
    let filePath = path.join('test', 'data', 'include_spotlight.html');
    let html = fs.readFileSync(filePath, 'utf8');
    let task = home.parseSpotlight(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      let r = validator.validate(result, { "type": "array", "items": { "$ref": "/SpotlightItem" } }, { nestedErrors: true });
      expect(r.valid).to.be.true;


      done();
    }).catch(err => { throw err; })
  });

  it('scrape messages', (done) => {
    let filePath = path.join('test', 'data', 'class_message_view.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = home.parseMessages(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {

      let r = validator.validate(result, { "type": "array", "items": { "$ref": "/FacultyMessage" } }, { nestedErrors: true });

      expect(r.valid).to.be.true;

      done();
    }).catch(err => { throw err; })
  });

  it('scrape leave request applications', (done) => {
    let filePath = path.join('test', 'data', 'leave_request.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = hostel.parseLeaveApplications(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      let schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "applications": { "type": "array", "items": { "$ref": "/HostelApplication" } },
          "authorities": { "type": "array", "items": { "type": "string", "minItems": 1 } }
        }
      }
      let r = validator.validate(result, schema, { nestedErrors: true });
      expect(r.valid).to.be.true;

      done();
    }).catch(err => { throw err; })
  });
});
