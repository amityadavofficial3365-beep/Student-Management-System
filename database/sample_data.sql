-- Optional demo data so the dashboard is not empty.
-- Run AFTER the API has started once (it seeds departments and courses).
-- Usage:  psql -U sms_user -d student_management -f database/sample_data.sql

INSERT INTO "Students" ("StudentCode", "FullName", "Email", "PhoneNumber", "CourseId", "EnrollmentDate")
SELECT v.code, v.name, v.email, v.phone, c."Id", v.enrolled::date
FROM (VALUES
    ('STU9001', 'Riya Sharma',  'riya.sharma@example.com',  '9000000001', 'BCA',                  '2025-07-15'),
    ('STU9002', 'Arjun Mehta',  'arjun.mehta@example.com',  '9000000002', 'B.Sc Computer Science','2025-07-18'),
    ('STU9003', 'Sneha Patil',  'sneha.patil@example.com',  '9000000003', 'B.Com',                '2025-08-01'),
    ('STU9004', 'Karan Singh',  'karan.singh@example.com',  '9000000004', 'B.Sc Physics',         '2025-08-05'),
    ('STU9005', 'Meera Nair',   'meera.nair@example.com',   '9000000005', 'B.A English',          '2025-08-10')
) AS v(code, name, email, phone, course, enrolled)
JOIN "Courses" c ON c."Name" = v.course
ON CONFLICT DO NOTHING;
