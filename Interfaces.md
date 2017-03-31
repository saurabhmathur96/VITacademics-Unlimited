```
Attendance {
  course_code: String,
  course_title: String,
  course_type: String,
  slot: String,
  registration_date: String,
  attended_classes: String,
  total_classes: String,
  attendance_percentage: String,
  status: String
  details: Array<AttendanceDetail>
}
```

```
AttendanceDetail {
  date: String,
  slot: String,
  status: String,
  units: String,
  reason: String
}
```

```
DailySchedule {
  class_number: String,
  course_code: String,
  course_name: String,
  course_type: String,
  ltpjc: String,
  course_mode: String,
  course_option: String,
  slot: String,
  venue: String,
  faculty_name: String
}
```

```
ExamSchedule {
  course_code: String,
  course_name: String,
  course_type: String,
  slot: String,
  exam_date: String,
  week_day: String,
  session: String,
  time: String,
  venue: String,
  table_number: String
}
```

```
Marks {
  class_number: Integer,
  course_code: String,
  course_title: String,
  course_type: String,
  marks: Array<MarksDetail>
}
```

```
MarksDetail {
  title: String,
  max_marks: Float,
  weightage: Float,
  conducted_on: String,
  status: String,
  scored_marks: Float,
  scored_percentage: Float
}
```


```
GradeDetail {
  course_code: String,
  course_title: String,
  course_type: String,,
  credits: Integer,
  grade: String,
  exam_held: String,
  result_date: String,
  option: String
}
```

```
SemesterGradeDetail {
  exam_held: String,
  credits: Integer,
  gpa: Float
}
```

```
GradeCount {
  count: Integer,
  value: Integer,
  grade: String
}
```


