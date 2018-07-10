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
  _Scrapes Assignments_

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

  _/student/hostelbeta/applications_

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
      applications: Array<HostelApplication>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED




**Hostel Leave Application**
----
  _Makes request to vtop to apply for a leave. [Vellore Only]_

* **URL**

  _/student/hostelbeta/leave_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `place`=[string]

  `reason`=[string]

  `type`=[string]

  `from`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

  `to`=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z

* **Constraints**

  `to` should be after `from`.

  `type` can have following values

  |Value| Meaning                                          |
  |----- |:-------------------------------------------------|
  |"EY1" | Emergency Leave                                 |
  |"SL1" | Semester Leave                                  |
  |"HT1" | Home Town / Local Guardian"s Place              |
  |"LG1" | Local Guardian                                  |
  |"SV"  | Summer Vacation                                 |
  |"EP"  | Official Events                                 |
  |"WV"  | Winter Vacation                                 |
  |"WP"  | With Parent Leave                               |
  |"OG1" | Outing                                          |

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<HostelApplication>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST




**Hostel Application Cancellation**
----
  _Makes request to vtop to cancel to a leave/outing. [Vellore Only]_

* **URL**

  _/student/hostelbeta/cancel_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `application_id`=[string]
  
  `place`=[string]

* **Constraints**

  `application_id` should be from an existing applied leave/outing (see `HostelAplication`).

* **Success Response:**


  * **Code:** 200 <br />
    **Content:**
    ```
    {
      applications: Array<HostelApplication>
    }
    ````
* **Error Response:**

  * **Code:** 403 UNAUTHORIZED




**Late Hours Permission Application**
----
  _Makes request to vtop to apply for a late hours permission. [Vellore Only]_

* **URL**

  _/student/latebeta/apply_

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

  `from_time` and `to_time` can have the following values

  |Value| Meaning              | 
  |---- |:---------------------|
  |"0"  | "8 PM"               |
  |"1"  | "9 PM"               |
  |"2"  | "10 PM"              |
  |"3"  | "11 PM"              |
  |"4"  | "12 AM"              |
  |"5"  | "1 AM"               |
  |"6"  | "2 AM"               |
  
  `school` can have the following values

  |Value  |Meaning                                                             |
  |-------|:-------------------------------------------------------------------|
  |  '74' | 'SAS School of Advanced Sciences'                                  |
  |  '98' | 'VSPARC School of Architecture'                                    |
  |  '73' | 'SAP School of Architecture and Planning'                          |
  |  '75' | 'SBST School of Bio Sciences and Technology'                       |
  |  '76' | 'SCALE School of Civil and Chemical Engineering'                   |
  |  '77' | 'SCOPE School of Computer Engineering'                             |
  |  '78' | 'SCSE School of Computing Sciences and Engineering'                |
  |  '80' | 'SELECT School of Electrical Engineering'                          |
  |  '81' | 'SENSE School of Electronics Engineering'                          |
  |  '82' | 'SITE School of Information Technology and Engineering'            |
  |  '84' | 'SMEC School of Mechanical Engineering'                            | 
  |  '83' | 'SMBS School of Mechanical and Building Sciences'                  |
  |  '88' | 'SSL School of Social Sciences &amp; Languages'                    |
  |  '92' | 'TIFAC Technology Information Forecasting and Assessment Council'  |
  |  '96' | 'VITBS VIT Business School'                                        |
  |  '95' | 'VFIT VIT Fachion Technology'                                      | 
  |  '97' | 'VITLS VIT School of Law'                                          |


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

  _/student/latebeta/applications_

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

  _/student/latebeta/cancel_

* **Method:**

  `POST`

* **Data Params**

  `reg_no`=[string]

  `password`=[string]

  `cancel_id`=[string]
  
  `place`=[string]
  

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


**Curriculum**
----
  _Scrapes my curriculum. [Vellore only]_

* **URL**

  _/student/curriculum_

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
      pc : Array<Course>,
      pe : Array<Course>,
      ue : Array<Course>,
      uc : Array<Course>
    }
    ````

* **Error Response:**

  * **Code:** 403 UNAUTHORIZED

  * **Code:** 400 BAD REQUEST

