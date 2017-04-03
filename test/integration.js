var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var supertest = require('supertest');
var app = require(path.join(__dirname, '..', 'src', 'app'));
var request = supertest(app);

var Promise = require('bluebird');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;


try {
  var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json'), 'utf-8'));
} catch (ex) {
  console.error('Credentials not found. Please create test/credentials.json with keys (reg_no, password).')
}

var db = null;
var uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
var faculty = [
  { name: 'TEST FACULTY ALPHA', school: 'School of Information Technology and Engineering', designation: 'Associate Professor', room: 'SJT-213-A39', intercom: '123', email: 'emai1l@domain.com', division: '	Department of Digital Communications (SITE)', additional_role: '', open_hours: [{ 'day': 'Mom', 'start_time': '04:00 PM', 'end_time': '06:00 PM' }, { 'day': 'Tue', 'start_time': '04:00 PM', 'end_time': '06:00 PM' }], test: true },
  { name: 'TEST FACULTY BETA', school: 'School of Advanced Sciences', designation: 'Assistant Professor (Senior)', room: 'TT-430-E', intercom: '1234', email: 'email2@domain.com', division: 'Department of Physics (SAS)', additional_role: '', open_hours: [{ 'day': 'Fri', 'start_time': '04:00 PM', 'end_time': '06:00 PM' }, { 'day': 'Tue', 'start_time': '04:00 PM', 'end_time': '06:00 PM' }], test: true }
];

describe('Integration Tests', () => {
  // Setup: Add dummy entries to db.
  before((done) => {
    var task = MongoClient.connect(uri, { promiseLibrary: Promise });
    task.then((_db) => {
      db = _db;

      return db.collection('faculty').insertMany(faculty);
    })
      .then(() => {
        done();
      })
      .catch((err) => {
        throw err;
      });
  });

  // Teardown: Remove dummy entries from db.
  after((done) => {
    db.collection('faculty').remove({ test: true })
      .then(() => {
        done();
      })
      .catch((err) => {
        throw err;
      });
  });

  if (credentials) {
    it('POST /student/refresh', (done) => {
      request.post('/student/refresh')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;

          expect(res.body).to.have.property('attendance');
          expect(res.body.attendance).to.be.instanceof(Array);
          expect(res.body.attendance.length).to.be.above(0);

          expect(res.body).to.have.property('timetable');
          expect(res.body.timetable).to.be.instanceof(Array);
          expect(res.body.timetable.length).to.be.above(0);


          expect(res.body).to.have.property('exam_schedule');
          expect(res.body.exam_schedule).to.be.instanceof(Object);
          expect(res.body.exam_schedule).to.have.property('CAT - I');
          expect(res.body.exam_schedule['CAT - I']).to.be.instanceof(Array);
          expect(res.body.exam_schedule['CAT - I'].length).to.be.above(0);
          expect(res.body.exam_schedule).to.have.property('CAT - II');
          expect(res.body.exam_schedule['CAT - II']).to.be.instanceof(Array);
          expect(res.body.exam_schedule['CAT - II'].length).to.be.above(0);
          expect(res.body.exam_schedule).to.have.property('Final Assessment Test');
          expect(res.body.exam_schedule['Final Assessment Test']).to.be.instanceof(Array);
          expect(res.body.exam_schedule['Final Assessment Test'].length).to.be.above(0);

          expect(res.body).to.have.property('marks');
          expect(res.body.marks).to.be.instanceof(Array);
          expect(res.body.marks.length).to.be.above(0);


          done();
        });
    });

    it('POST /student/spotlight', (done) => {
      request.post('/student/spotlight')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
         expect(res.body).to.be.instanceof(Object);
         expect(res.body).to.have.property("spotlight")
         expect(res.body["spotlight"]).to.be.instanceof(Array);
          done();
        });
    });

    it('POST /student/messages', (done) => {
      request.post('/student/messages')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
         expect(res.body).to.be.instanceof(Object);
         expect(res.body).to.have.property("messages")
         expect(res.body["messages"]).to.be.instanceof(Array);
          done();
        });
    });

    it('POST /student/grades', (done) => {
      request.post('/student/grades')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.have.property('grades');
          expect(res.body.grades).to.be.instanceof(Array);
          expect(res.body.grades.length).to.be.greaterThan(0);

          expect(res.body).to.have.property('semester_wise');
          expect(res.body.grades).to.be.instanceof(Object);

          expect(res.body).to.have.property('grade_count');
          expect(res.body.grade_count).to.be.instanceof(Array);
          expect(res.body.grade_count.length).to.be.greaterThan(0);

          done();
        });
    });
  }

  it('GET /faculty/search?name=[name]', (done) => {
    request.get('/faculty/search?name=test faculty')
      .expect(200)
      .end((err, res) => {
        expect(err).to.not.exist;

        expect(res.body).to.have.property('query');
        expect(res.body).to.have.property('result');

        expect(res.body.result).to.be.instanceOf(Array);
        expect(res.body.result.length).to.equal(2);

        done();

      });
  });

  it('GET /faculty/search?school=[school_name]', (done) => {
    request.get('/faculty/search?school=School of Advanced Sciences')
      .expect(200)
      .end((err, res) => {
        expect(err).to.not.exist;

        expect(res.body).to.have.property('query');
        expect(res.body).to.have.property('result');

        expect(res.body.result).to.be.instanceOf(Array);
        expect(res.body.result.length).to.be.greaterThan(0);

        done();

      });
  });

  it('GET /faculty/details/:faculty_id', (done) => {
    request.get('/faculty/search?name=test faculty alpha')
      .expect(200)
      .end((err1, res1) => {
        expect(err1).to.not.exist;

        expect(res1.body).to.have.property('query');
        expect(res1.body).to.have.property('result');

        expect(res1.body.result).to.be.instanceOf(Array);
        expect(res1.body.result.length).to.equal(1);

        request.get(`/faculty/details/${res1.body.result[0]._id}`)
          .expect(200)
          .end((err2, res2) => {
            expect(err2).to.not.exist;
            expect(res2.body.name).to.equal('TEST FACULTY ALPHA');
            done();
          });

      });
  });

})
