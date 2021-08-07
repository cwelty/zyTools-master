{
    code: `CREATE TABLE student (
   stu_id INTEGER PRIMARY KEY,
   last_name VARCHAR(50),
   first_name VARCHAR(50) NOT NULL,
   gpa FLOAT
);

INSERT INTO student VALUES (123, 'Miller', 'Susan', 3.1);
INSERT INTO student VALUES (456, NULL, 'Juan', 2.8);
INSERT INTO student VALUES (987, 'Rida', 'Adib', 3.7);
SELECT * FROM student WHERE stu_id > 200;`,
    solution: `SELECT last_name
FROM student
WHERE stu_id > 500;`,
}
