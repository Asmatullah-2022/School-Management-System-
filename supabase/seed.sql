-- =====================================================================
-- Demo seed data: "Government Model Primary School"
-- Run AFTER migrations. Safe to re-run (idempotent via fixed UUIDs).
-- This data is clearly flagged with is_demo = true on the school row.
-- =====================================================================

insert into schools (id, name, school_code, address, district, province, phone, email, principal_name, is_demo)
values ('00000000-0000-0000-0000-000000000001', 'Government Model Primary School', 'GMPS-001',
        'Main Bazaar Road', 'Lahore', 'Punjab', '042-1234567', 'info@gmps.edu.pk', 'Mr. Muhammad Aslam', true)
on conflict (id) do nothing;

insert into academic_sessions (id, school_id, name, start_date, end_date, is_current)
values ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '2025-2026', '2025-04-01', '2026-03-31', true)
on conflict (id) do nothing;

-- Classes
insert into classes (id, school_id, name, sort_order) values
  ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000001','Nursery',1),
  ('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000001','KG',2),
  ('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000001','Grade 1',3),
  ('00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000001','Grade 2',4),
  ('00000000-0000-0000-0000-000000000205','00000000-0000-0000-0000-000000000001','Grade 3',5),
  ('00000000-0000-0000-0000-000000000206','00000000-0000-0000-0000-000000000001','Grade 4',6),
  ('00000000-0000-0000-0000-000000000207','00000000-0000-0000-0000-000000000001','Grade 5',7)
on conflict (id) do nothing;

insert into sections (id, school_id, class_id, name, room, capacity) values
  ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000203','A','Room 1',35),
  ('00000000-0000-0000-0000-000000000302','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000204','A','Room 2',35),
  ('00000000-0000-0000-0000-000000000303','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000205','A','Room 3',35),
  ('00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000206','A','Room 4',35),
  ('00000000-0000-0000-0000-000000000305','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000207','A','Room 5',35)
on conflict (id) do nothing;

-- Subjects
insert into subjects (id, school_id, name, code) values
  ('00000000-0000-0000-0000-000000000401','00000000-0000-0000-0000-000000000001','English','ENG'),
  ('00000000-0000-0000-0000-000000000402','00000000-0000-0000-0000-000000000001','Urdu','URD'),
  ('00000000-0000-0000-0000-000000000403','00000000-0000-0000-0000-000000000001','Mathematics','MATH'),
  ('00000000-0000-0000-0000-000000000404','00000000-0000-0000-0000-000000000001','General Science','SCI'),
  ('00000000-0000-0000-0000-000000000405','00000000-0000-0000-0000-000000000001','Islamiat','ISL'),
  ('00000000-0000-0000-0000-000000000406','00000000-0000-0000-0000-000000000001','Computer Science','CS'),
  ('00000000-0000-0000-0000-000000000407','00000000-0000-0000-0000-000000000001','Social Studies','SST')
on conflict (id) do nothing;

-- Teachers (profile_id left null — link when real auth users are created)
insert into teachers (id, school_id, employee_id, full_name, father_name, gender, mobile, email, designation, qualification, joining_date, status) values
  ('00000000-0000-0000-0000-000000000501','00000000-0000-0000-0000-000000000001','EMP-001','Ayesha Siddiqui','Muhammad Siddiqui','female','0300-1111111','ayesha@gmps.edu.pk','Senior Teacher','M.Ed','2019-06-01','active'),
  ('00000000-0000-0000-0000-000000000502','00000000-0000-0000-0000-000000000001','EMP-002','Bilal Ahmed','Rasheed Ahmed','male','0300-2222222','bilal@gmps.edu.pk','Teacher','B.Ed','2021-08-15','active'),
  ('00000000-0000-0000-0000-000000000503','00000000-0000-0000-0000-000000000001','EMP-003','Sana Malik','Tariq Malik','female','0300-3333333','sana@gmps.edu.pk','Teacher','B.A, B.Ed','2020-03-10','active')
on conflict (id) do nothing;

update sections set class_teacher_id = '00000000-0000-0000-0000-000000000501' where id = '00000000-0000-0000-0000-000000000301';
update sections set class_teacher_id = '00000000-0000-0000-0000-000000000502' where id = '00000000-0000-0000-0000-000000000302';
update sections set class_teacher_id = '00000000-0000-0000-0000-000000000503' where id = '00000000-0000-0000-0000-000000000303';

-- Students
insert into students (id, school_id, admission_number, full_name, father_name, mother_name, gender, date_of_birth, contact_number, address, district, province, class_id, section_id, roll_number, admission_date, blood_group, status, academic_session_id) values
  ('00000000-0000-0000-0000-000000000601','00000000-0000-0000-0000-000000000001','GMPS-2025-001','Ali Hassan','Imran Hassan','Sadia Imran','male','2018-05-12','0301-1111111','Street 5, Model Town','Lahore','Punjab','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000301','1','2024-04-01','O+','active','00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000602','00000000-0000-0000-0000-000000000001','GMPS-2025-002','Fatima Noor','Shahid Noor','Rubina Shahid','female','2018-07-20','0301-2222222','Street 8, Model Town','Lahore','Punjab','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000301','2','2024-04-01','B+','active','00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000603','00000000-0000-0000-0000-000000000001','GMPS-2025-003','Hamza Khan','Nasir Khan','Farah Nasir','male','2017-02-15','0301-3333333','Street 2, Township','Lahore','Punjab','00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000302','1','2023-04-01','A+','active','00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000604','00000000-0000-0000-0000-000000000001','GMPS-2025-004','Zainab Bibi','Aslam Ali','Kausar Aslam','female','2017-09-09','0301-4444444','Street 3, Township','Lahore','Punjab','00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000302','2','2023-04-01','AB+','active','00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000605','00000000-0000-0000-0000-000000000001','GMPS-2025-005','Usman Tariq','Tariq Mehmood','Nasreen Tariq','male','2016-11-01','0301-5555555','Street 1, Gulberg','Lahore','Punjab','00000000-0000-0000-0000-000000000205','00000000-0000-0000-0000-000000000303','1','2022-04-01','O-','active','00000000-0000-0000-0000-000000000101')
on conflict (id) do nothing;

-- Attendance (last 5 days, mostly present)
insert into attendance (school_id, student_id, class_id, section_id, date, status)
select '00000000-0000-0000-0000-000000000001', s.id, s.class_id, s.section_id, d::date,
  case when random() < 0.85 then 'present' else 'absent' end::attendance_status
from students s
cross join generate_series(current_date - interval '4 day', current_date, interval '1 day') d
on conflict (student_id, date) do nothing;

-- Exam + marks
insert into exams (id, school_id, academic_session_id, name, exam_type, start_date, end_date) values
  ('00000000-0000-0000-0000-000000000701','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000101','Mid-Term Examination','mid_term','2025-10-01','2025-10-10')
on conflict (id) do nothing;

insert into exam_subjects (id, school_id, exam_id, class_id, subject_id, exam_date, total_marks, passing_marks) values
  ('00000000-0000-0000-0000-000000000801','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000701','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000401','2025-10-02',100,33),
  ('00000000-0000-0000-0000-000000000802','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000701','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000403','2025-10-04',100,33)
on conflict (id) do nothing;

insert into marks (school_id, exam_subject_id, student_id, obtained_marks) values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000801','00000000-0000-0000-0000-000000000601',78),
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000801','00000000-0000-0000-0000-000000000602',88),
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000802','00000000-0000-0000-0000-000000000601',65),
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000802','00000000-0000-0000-0000-000000000602',92)
on conflict (exam_subject_id, student_id) do nothing;

-- Fee structure + fees + payments
insert into fee_structures (id, school_id, class_id, academic_session_id, name, amount, frequency) values
  ('00000000-0000-0000-0000-000000000901','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000101','Monthly Tuition Fee',2500,'monthly')
on conflict (id) do nothing;

insert into fees (id, school_id, student_id, fee_structure_id, title, amount, due_date, status) values
  ('00000000-0000-0000-0000-000000000a01','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000601','00000000-0000-0000-0000-000000000901','Monthly Tuition Fee - Sep 2025',2500,'2025-09-10','paid'),
  ('00000000-0000-0000-0000-000000000a02','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000602','00000000-0000-0000-0000-000000000901','Monthly Tuition Fee - Sep 2025',2500,'2025-09-10','unpaid')
on conflict (id) do nothing;

insert into payments (school_id, fee_id, student_id, amount_paid, payment_date, payment_method, receipt_number) values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000a01','00000000-0000-0000-0000-000000000601',2500,'2025-09-08','cash','RC-0001')
on conflict do nothing;

-- Homework
insert into homework (school_id, class_id, section_id, subject_id, teacher_id, title, description, due_date) values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000403','00000000-0000-0000-0000-000000000501','Practice Sheet: Addition','Complete exercise 3.1 to 3.3',current_date + 3);

-- Notices & events
insert into notices (school_id, title, description, audience, priority, publish_date) values
  ('00000000-0000-0000-0000-000000000001','Mid-Term Exams Schedule Announced','Mid-term examinations will begin from 1st October. Please check the exam schedule.','all','high',current_date);

insert into events (school_id, title, description, start_date, location) values
  ('00000000-0000-0000-0000-000000000001','Annual Sports Day','Inter-house sports competition for all classes.',current_date + 20,'School Playground');
