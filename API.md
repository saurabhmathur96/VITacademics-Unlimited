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




**Home**
----
  _Scrapes faculty messages and spotlight items._

* **URL**

  _/student/home_

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
      spotlight: Array<SpotlightItem>,
      messages: Array<FacultyMessage>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED



**Hostel Application Details**
----
  _Responds with details and status of leave/outing requests along with available approving authorities._

* **URL**

  _/student/hostel/applications_

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
      applications: Array<HostelApplication>,
      authorities: Array<ApprovingAuthority>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED




**Hostel Outing Application**
----
  _Makes request to vtop to apply for an outing._

* **URL**

  _/student/hostel/outing_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `authority`=[string]

  `place`=[string]

  `reason`=[string]

  `from`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

  `to`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

* **Constraints**

  `to` and `from` should be on same day.

  `to` should be after `from`.

  Outing can only be between 7AM to 6PM.

  `authority` id should be from the `authorities` list.

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<HostelApplication>,
      authorities: Array<ApprovingAuthority>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST




**Hostel Leave Application**
----
  _Makes request to vtop to apply for a leave._

* **URL**

  _/student/hostel/leave_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `authority`=[string]

  `place`=[string]

  `reason`=[string]

  `type`=[string]

  `from`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

  `to`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

* **Constraints**

  `to` should be after `from`.

  `authority` id should be from the `authorities` list.

  `type` can have following values

  |Value| Meaning                                          |
  |-----|:-------------------------------------------------|
  |"EY" | Emergency Leave                                  |
  |"AE" | Examinations (GATE)                              |
  |"HT" | Home Town / Local Guardian"s Place               |
  |"II" | Industrial Visit (Through Faculty Coordinators)  |
  |"PJ" | Off Campus Interviews (Throught PAT Office)      |
  |"EP" | Official Events                                  |
  |"WV" | Winter Vacation                                  |
  |"WP" | With Parent Leave                                |

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<HostelApplication>,
      authorities: Array<ApprovingAuthority>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST




**Hostel Application Cancellation**
----
  _Makes request to vtop to cancel to a leave/outing._

* **URL**

  _/student/hostel/cancel_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `application_id`=[integer]

* **Constraints**

  `application_id` should be from an existing applied leave/outing (see `HostelAplication`).

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<HostelApplication>,
      authorities: Array<ApprovingAuthority>
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
      faculty: Array<Faculty>
    }
    ````
