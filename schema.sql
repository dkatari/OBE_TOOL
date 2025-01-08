drop database obe;
create database OBE;
use OBE;

-- Users Table
CREATE TABLE Users (
    faculty_id VARCHAR(10) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);
insert into Users 
values
('CSE101','12');
-- Academic Year Table
CREATE TABLE Academic_Year (
    academic_year_id INT PRIMARY KEY AUTO_INCREMENT,
    year VARCHAR(20) NOT NULL UNIQUE
);

-- Semester Type Table
CREATE TABLE Semester_Type (
    sem_id INT PRIMARY KEY,
    type ENUM('Odd', 'Even') NOT NULL
);

-- Branch Table
CREATE TABLE Branch (
    branch_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Mapping Table (Branch - Semester Type - Academic Year)
CREATE TABLE Branch_Semester_Mapping (
    mapping_id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year_id INT NOT NULL,
    sem_id INT NOT NULL,
    branch_id INT NOT NULL,
    FOREIGN KEY (academic_year_id) REFERENCES Academic_Year(academic_year_id),
    FOREIGN KEY (sem_id) REFERENCES Semester_Type(sem_id),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- Subjects Table
CREATE TABLE Subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    mapping_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    L INT NOT NULL,  -- Lecture hours
    T INT NOT NULL,  -- Tutorial hours
    P INT NOT NULL,  -- Practical hours
    S INT NOT NULL,  -- Seminar hours
    J INT NOT NULL,  -- Project/Job-related hours
    C INT NOT NULL,  -- Credits
    max_marks INT NOT NULL,
    FOREIGN KEY (mapping_id) REFERENCES Branch_Semester_Mapping(mapping_id)
);

-- Faculty Mapping Table
CREATE TABLE Faculty_Mapping (
    faculty_mapping_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    faculty_details VARCHAR(255) NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id)
);


-- Insert data into Semester_Type table
INSERT INTO Semester_Type (sem_id, type)
VALUES 
(1, 'Odd'),
(2, 'Even'),
(3, 'Odd'),
(4, 'Even'),
(5, 'Odd'),
(6, 'Even'),
(7, 'Odd'),
(8, 'Even');


-- Insert data into Branch table
INSERT INTO Branch (name)
VALUES 
('CSE - CORE'),
('CSE - AIML'),
('CSE - DATA SCIENCE'),
('CSE - CYBER SECURITY'),
('CSE - CSBS');
