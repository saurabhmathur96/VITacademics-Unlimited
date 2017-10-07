API Documentation
=================

This API documentation refers to JSON schemas (ex. Attendance) which can be found in the `schemas` directory.

**Refresh**
----
  _Scrapes attendance, timetable, exam schedule and marks. [Vellore and Chennai]_

* **URL**

  _/student/refresh_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `semester`=[string, optional]

  `campus`=[string, optional, default="vellore"]

* **Constraints**
  `semester` can have one of the following values

  |Value| Meaning                                          |
  |-----|:-------------------------------------------------|
  |"WS" | Winter Semester                                  |
  |"SS" | Summer Semester                                  |
  |"IS" | Inter Semester                                   |
  |"TS" | Tri Semester                                     |
  |"FS" | Fall Semester                                    |

  `campus` can either be "vellore" or "chennai".

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
      marks: Array<Marks>,
      semester: string,
      default_semester: string
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST


**Grades**
----
  _Scrapes academics history. [Vellore and Chennai]_

* **URL**

  _/student/grades_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `campus`=[string, optional, default="vellore"]


* **Constraints**

  `campus` can either be "vellore" or "chennai".


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


**Assignments**
----
  _Scrapes Assignments

* **URL**

  _/student/assignments_

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
      courses: Array<AssignmentBetaCourse>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST




**Home**
----
  _Scrapes faculty messages and spotlight items. [Vellore and Chennai]_

* **URL**

  _/student/home_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]


* **Constraints**

  `campus` can either be "vellore" or "chennai".

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      spotlight: Array<SpotlightItem>,
      messages: Array<FacultyMessage>,
      cookies: Array<string>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED



**Hostel Application Details**
----
  _Responds with details and status of leave/outing requests along with available approving authorities. [Vellore Only]_

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
  _Makes request to vtop to apply for an outing. [Vellore Only]_

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
  _Makes request to vtop to apply for a leave. [Vellore Only]_

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
  _Makes request to vtop to cancel to a leave/outing. [Vellore Only]_

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




**Late Hours Permission Application**
----
  _Makes request to vtop to apply for a late hours permission. [Vellore Only]_

* **URL**

  _/student/late/apply_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `school`=[string]

  `faculty_id`=[string]

  `place`=[string]

  `reason`=[string]

  `from_date`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

  `to_date`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

  `from_time`=[string]

  `to_time`=[string]

* **Constraints**

  `to` should be after `from`.

  `faculty_id` should be from the list of schools from `/faculty/late`.

  `from_time` can have the following values

  |Value     |
  |----------|
  |"08:00 PM"|
  |"09:00 PM"|
  |"10:00 PM"|
  |"11:00 PM"|
  |"12:00 AM"|
  |"01:00 AM"|
  |"02:00 AM"|
  |"03:00 AM"|
  |"04:00 AM"|

  `to_time` can have the following values

  |Value     |
  |----------|
  |"09:00 PM"|
  |"10:00 PM"|
  |"11:00 PM"|
  |"12:00 AM"|
  |"01:00 AM"|
  |"02:00 AM"|
  |"03:00 AM"|
  |"04:00 AM"|
  |"05:00 AM"|

  `school` can have the following values

  |Value     |
  |----------|
  |"ASC"     |
  |"ARC"     |
  |"CO2"     |
  |"CBST"    |
  |"CBCMT"   |
  |"CCG"     |
  |"CDMM"    |
  |"CIMR"    |
  |"CNBT"    |
  |"CNR"     |
  |"IIIP"    |
  |"O/o-COE" |
  |"SAS"     |
  |"VSPARC"  |
  |"SBST"    |
  |"SCALE"   |
  |"SCOPE"   |
  |"SELECT"  |
  |"SENSE"   |
  |"SITE"    |
  |"SMEC"    |
  |"SSL"     |
  |"TIFAC"   |
  |"VITBS"   |


* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<LateHoursApplication>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST



**Late Hours Permission Application Details**
----
  _Responds with details and status of late hours permission requests. [Vellore Only]_

* **URL**

  _/student/late/applications_

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
      applications: Array<LateHoursApplication>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED



**Late Hours Permission Application Cancellation**
----
  _Makes request to vtop to cancel to a late hours permission application. [Vellore Only]_

* **URL**

  _/student/late/cancel_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `cancel_id`=[string]

* **Constraints**

  `string` should be from an existing applied leave/outing (see `LateHoursAplication`).

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<LateHoursApplication>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED



**All Faculty**
----
  _Responds with details of all ~2k faculty. [Unauthenticated]_

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


**Faculty who can approve late hours permissions**
----
  _Responds with a list of school with ids of faculty who can approve late hours permission. [Unauthenticated]_

* **URL**

  _/faculty/late_

* **Method:**

  `GET`

* **Data Params**

  None

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      schools: Array<LateHoursSchool>
    }
    ````
