create database OBE;
use OBE;

CREATE TABLE Batches (
batch_id INT AUTO_INCREMENT PRIMARY KEY,      
batch_start_year YEAR NOT NULL,                
batch_end_year YEAR NOT NULL,                  
CHECK (batch_start_year <= batch_end_year)     
);

CREATE TABLE Departments (
dept_id INT AUTO_INCREMENT PRIMARY KEY,
dept_name VARCHAR(255) NOT NULL      
);

CREATE TABLE Courses (
course_id INT AUTO_INCREMENT PRIMARY KEY, 
course_name VARCHAR(255) NOT NULL,  
course_code VARCHAR(50) NOT NULL,  
credits INT NOT NULL   
);

CREATE TABLE Faculty (
faculty_id INT AUTO_INCREMENT PRIMARY KEY, 
faculty_name VARCHAR(255) NOT NULL, 
email VARCHAR(255) NOT NULL UNIQUE  
);


CREATE TABLE SemDeptBatch (
mapping_id INT AUTO_INCREMENT PRIMARY KEY,    
sem_number INT NOT NULL,                      
dept_id INT NOT NULL,                          
batch_id INT NOT NULL,                         
start_date DATE NOT NULL,                   
end_date DATE NOT NULL,                     
FOREIGN KEY (batch_id) REFERENCES Batches(batch_id), 
FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) 
);

CREATE TABLE SemDeptBatchCourses (
    mapping_id INT AUTO_INCREMENT PRIMARY KEY,    
    course_id INT NOT NULL,                        
    sem_dept_batch_id INT NOT NULL,                
    semester INT NOT NULL,                         
    semester_year YEAR NOT NULL,                   
    FOREIGN KEY (course_id) REFERENCES Courses(course_id), 
    FOREIGN KEY (sem_dept_batch_id) REFERENCES SemDeptBatch(mapping_id) 
);

CREATE TABLE SubjectFacultyMapping (
mapping_id INT AUTO_INCREMENT PRIMARY KEY,  
course_id INT NOT NULL,   
faculty_id INT NOT NULL,   
FOREIGN KEY (course_id) REFERENCES Courses(course_id), 
FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) 
);

-- INSERT VALUES

INSERT INTO Batches (batch_start_year, batch_end_year) VALUES
(2022, 2026),
(2023, 2027),
(2024, 2028);

INSERT INTO Departments (dept_name) VALUES
('Computer Science'),
('Electrical Engineering'),
('Mechanical Engineering');

INSERT INTO Courses (course_name, course_code, credits) VALUES
('Data Structures', 'CS101', 3),
('Digital Logic Design', 'EE201', 4),
('Thermodynamics', 'ME301', 3);

INSERT INTO Faculty (faculty_name, email) VALUES
('Dr. Alice Smith', 'alice.smith@example.com'),
('Dr. Bob Johnson', 'bob.johnson@example.com'),
('Dr. Carol Davis', 'carol.davis@example.com');

INSERT INTO SemDeptBatch (sem_number, dept_id, batch_id, start_date, end_date) VALUES
(1, 1, 1, '2022-08-01', '2022-12-15'),
(2, 1, 1, '2023-01-15', '2023-05-30'),
(1, 2, 2, '2023-08-01', '2023-12-15');

INSERT INTO SemDeptBatchCourses (course_id, sem_dept_batch_id, semester, semester_year) VALUES
(1, 1, 1, 2022),
(2, 2, 2, 2023),
(3, 3, 1, 2023);

INSERT INTO SubjectFacultyMapping (course_id, faculty_id) VALUES
(1, 1),
(2, 2),
(3, 3);
