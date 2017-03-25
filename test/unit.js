var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var spotlight = require(path.join(__dirname, '..', 'src', 'scrapers', 'spotlight'));
var attendance = require(path.join(__dirname, '..', 'src', 'scrapers', 'attendance'));
var schedule = require(path.join(__dirname, '..','src', 'scrapers', 'schedule'));
var history = require(path.join(__dirname, '..', 'src', 'scrapers', 'history'));
var home = require(path.join(__dirname, '..', 'src', 'scrapers', 'home'));

describe('Unit Tests', () => {
  it('scrape spotlight', (done) => {
    let filePath = path.join('test', 'data', 'include_spotlight.html');
    let html = fs.readFileSync(filePath, 'utf8');
    let task = spotlight.parse(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);


      done();
    }).catch(err => { throw err; })
  });

  it('scrape attendance details', (done) => {
    let filePath = path.join('test', 'data', 'attn_report_details.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = attendance.parseDetails(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);


      done();
    }).catch(err => { throw err; })
  });

  it('scrape attendance report', (done) => {
    let filePath = path.join('test', 'data', 'attn_report.html');
    let html = fs.readFileSync(filePath, 'utf8');
    let task = attendance.parseReport(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);

      done();
    }).catch(err => { throw err; })
  });

  it('scrape grades', (done) => {
    let filePath = path.join('test', 'data', 'student_history.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = history.parse(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);
      done();
    }).catch(err => { throw err; })
  });

  it('scrape timetable', (done) => {
    let filePath = path.join('test', 'data', 'attn_report.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = schedule.parseDaily(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);

      done();
    }).catch(err => { throw err; })
  });

  it('scrape exam schedule', (done) => {
    let filePath = path.join('test', 'data', 'attn_report.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = schedule.parseExam(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);

      done();
    }).catch(err => { throw err; })
  });

  it('scrape messages', (done) => {
    let filePath = path.join('test', 'data', 'stud_home.html')
    let html = fs.readFileSync(filePath, 'utf8');
    let task = home.parseMessages(html);
    expect(task).to.be.a('promise');

    task.then(result => {
      expect(result).to.be.instanceof(Array);

      done();
    }).catch(err => { throw err; })
  });
})
