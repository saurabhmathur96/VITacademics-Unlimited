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


describe('Integration Tests', () => {
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
          expect(res.body).to.have.property('spotlight')
          expect(res.body['spotlight']).to.be.instanceof(Array);
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
          expect(res.body).to.have.property('messages')
          expect(res.body['messages']).to.be.instanceof(Array);
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

  it('GET /faculty/all', (done) => {
    request.get('/faculty/all')
      .expect(200)
      .end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.have.property('faculty');
        expect(res.body.faculty).to.be.instanceof(Array);
        expect(res.body.faculty.length).to.be.greaterThan(0);
        done();
      });
  });
})
