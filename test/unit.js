var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird')

var home = require(path.join(__dirname, '..', 'src', 'scrapers', 'home'));
var attendance = require(path.join(__dirname, '..', 'src', 'scrapers', 'attendance'));
var schedule = require(path.join(__dirname, '..', 'src', 'scrapers', 'schedule'));
var academic = require(path.join(__dirname, '..', 'src', 'scrapers', 'academic'));
var home = require(path.join(__dirname, '..', 'src', 'scrapers', 'home'));

describe('Unit Tests', () => {

  it('scrape attendance report', (done) => {
    let filePath = path.join('test', 'data', 'attn_report.html');
    let html = fs.readFileSync(filePath, 'utf8');
    let task = attendance.parseReport(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      expect(result).to.be.instanceof(Array);


      done();
    }).catch(err => { throw err; })
  });
  it('scrape attendance details', (done) => {
    let filePath = path.join('test', 'data', 'attn_report_details.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = attendance.parseDetails(html);
    expect(task).to.be.instanceof(Promise);

    task.then(result => {
      expect(result).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });

  it('scrape grades', (done) => {
    let filePath = path.join('test', 'data', 'student_history.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = academic.parseHistory(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {;
      expect(result).to.be.instanceof(Object);
      expect(result).to.have.property('grades');
      expect(result).to.have.property('semester_wise');
      expect(result).to.have.property('grade_count');

      expect(result.grades).to.be.instanceOf(Array);
      expect(result.semester_wise).to.be.instanceOf(Object);
      expect(result.grade_count).to.be.instanceOf(Array);

      done();
    }).catch(err => { throw err; })
  });

  it('scrape marks', (done) => {
    let filePath = path.join('test', 'data', 'marks.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = academic.parseMarks(html);
    expect(task).to.be.instanceOf(Promise);
    task.then(result => {
      expect(result).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });

  it('scrape timetable', (done) => {
    let filePath = path.join('test', 'data', 'course_regular.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = schedule.parseDaily(html, 'vellore');
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      expect(result).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });

  it('scrape exam schedule', (done) => {
    let filePath = path.join('test', 'data', 'exam_schedule.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = schedule.parseExam(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      expect(result).to.be.instanceof(Object);
      expect(result).to.have.property('CAT - I')
      expect(result).to.have.property('CAT - II')
      expect(result).to.have.property('Final Assessment Test')

      expect(result['CAT - I']).to.be.instanceof(Array);
      expect(result['CAT - II']).to.be.instanceof(Array);
      expect(result['Final Assessment Test']).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });

  it('scrape spotlight', (done) => {
    let filePath = path.join('test', 'data', 'include_spotlight.html');
    let html = fs.readFileSync(filePath, 'utf8');
    let task = home.parseSpotlight(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      expect(result).to.be.instanceof(Object);
      expect(result).to.have.property("spotlight")
      expect(result["spotlight"]).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });

  it('scrape messages', (done) => {
    let filePath = path.join('test', 'data', 'class_message_view.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = home.parseMessages(html);
    expect(task).to.be.instanceOf(Promise);

    task.then(result => {
      expect(result).to.be.instanceof(Object);
      expect(result).to.have.property("messages")
      expect(result["messages"]).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });
})
