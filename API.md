API Documentation
=================

This API documentation refers to JSON schemas (ex. Attendance) which can be found in the `schemas` directory.

**Refresh**
----
  _Scrapes attendance, timetable, exam schedule and marks._

* **URL**

  _/student/refresh_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      attendance : Array<Attendance>,
      timetable: Array<DailySchedule>,
      exam_schedule: {
        "CAT - I": Array<ExamSchedule>,
        "CAT - II": Array<ExamSchedule>,
        "Final Assessment Test": Array<ExamSchedule>
      },
      marks: Array<Marks>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED


**Grades**
----
  _Scrapes academics history._

* **URL**

  _/student/grades_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      grades: Array<GradeDetail>,
      semester_wise: Array<SemesterGradeDetail>,
      grade_count: Array<GradeCount>,
      credits_registered: Float,
      credits_earned: Float,
      cgpa: Float
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED


**Messages**
----
  _Scrapes messages sent by faculty._

* **URL**

  _/student/messages_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      messages: Array<FacultyMessage>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED


**Spotlight**
----
  _Scrapes spotlight items._

* **URL**

  _/student/spotlight_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      spotlight: Array<SpotlightItem>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED




**All Faculty**
----
  _Responds with details of all ~2k faculty._

* **URL**

  _/faculty/all_

* **Method:**

  `GET`

* **Data Params**

  None

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      Faculty: Array<Faculty>
    }
    ````
