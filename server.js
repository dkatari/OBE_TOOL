const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Use the promise-based API
const session = require('express-session');

const app = express();

// Create MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10, // Adjust based on your needs
    host: 'localhost',
    user: 'root',
    password: 'HACK#15@LOCK',
    database: 'OBE'
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Select Batch Routing
app.get('/', (req, res) => {
    res.redirect('/select-batch');
});

app.get('/select-batch', (req, res) => {
    pool.query('SELECT * FROM Batches')
        .then(([batches]) => {
            res.render('selectBatch', { batches });
        })
        .catch(err => {
            console.error('Error fetching batches:', err);
            res.status(500).send('Server error');
        });
});

app.post('/batches/select', (req, res) => {
    const selectedBatchId = req.body.batch_id;
    res.redirect(`/map-sem-dept-batch?batch_id=${selectedBatchId}`);
});

// Map - Sem - Dept - Batch Routing
app.get('/map-sem-dept-batch', (req, res) => {
    const batchId = req.query.batch_id;
    pool.query('SELECT * FROM Departments')
        .then(([departments]) => {
            res.render('mapSemDeptBatch', { batchId, departments });
        })
        .catch(err => {
            console.error('Error fetching departments:', err);
            res.status(500).send('Server error');
        });
});

app.post('/map-sem-dept-batch/submit', (req, res) => {
    const { batch_id, sem_number, dept_id, start_date, end_date } = req.body;

    const query = `
        INSERT INTO SemDeptBatch (sem_number, dept_id, batch_id, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
    `;
    pool.query(query, [sem_number, dept_id, batch_id, start_date, end_date])
        .then(() => {
            res.redirect(`/map-subjects?batch_id=${batch_id}&sem_number=${sem_number}&dept_id=${dept_id}`);
        })
        .catch(err => {
            console.error('Error saving mapping:', err);
            res.status(500).send('Server error');
        });
});

// Map Subjects Routing
app.get('/map-subjects', (req, res) => {
    const { batch_id, sem_number, dept_id } = req.query;
    const query = `
        SELECT c.course_id, c.course_name 
        FROM Courses c
        JOIN SemDeptBatchCourses sdbc ON c.course_id = sdbc.course_id
        JOIN SemDeptBatch sdb ON sdbc.sem_dept_batch_id = sdb.mapping_id
        WHERE sdb.batch_id = ? AND sdb.sem_number = ? AND sdb.dept_id = ?
    `;
    pool.query(query, [batch_id, sem_number, dept_id])
        .then(([courses]) => {
            res.render('mapSubjects', { courses, batch_id, sem_number, dept_id });
        })
        .catch(err => {
            console.error('Error fetching courses:', err);
            res.status(500).send('Server error');
        });
});

app.post('/map-subjects/submit', (req, res) => {
    const { selectedSubjects, batch_id, sem_number, dept_id } = req.body;

    if (!selectedSubjects || !Array.isArray(selectedSubjects) || selectedSubjects.length === 0) {
        console.error('No subjects selected');
        return res.status(400).send('No subjects selected');
    }

    const insertQuery = `
        INSERT INTO SemDeptBatchCourses (course_id, sem_dept_batch_id, semester, semester_year)
        VALUES (?, ?, ?, ?)
    `;

    const semDeptBatchId = `${ batch_id }-${ sem_number } -${ dept_id }`;  // You can modify this logic as per your requirement
    const insertTasks = selectedSubjects.map((subjectId) =>
        pool.query(insertQuery, [subjectId, semDeptBatchId, sem_number, new Date().getFullYear()])
    );

    Promise.all(insertTasks)
        .then(() => res.redirect('/next-page'))
        .catch(err => {
            console.error('Error saving subjects:', err);
            res.status(500).send('Server error while saving subjects');
        });
});

// Assign Subjects to Faculty
app.get('/assign-subjects', async (req, res) => {
    const { batch_id, sem_number, dept_id } = req.query;
    try {
        const [subjects] = await pool.query(
            'SELECT course_id, course_name FROM Courses WHERE course_id IN (SELECT course_id FROM SemDeptBatchCourses WHERE batch_id = ? AND sem_number = ? AND dept_id = ?)',
            [batch_id, sem_number, dept_id]
        );

        const [faculty] = await pool.query('SELECT faculty_id, faculty_name FROM Faculty');
        res.render('assignSubjects', {
            batch_id,
            sem_number,
            dept_id,
            subjects,
            faculty,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});

app.post('/assign-subjects/submit', async (req, res) => {
    const { batch_id, sem_number, dept_id, subject_ids, faculty_ids } = req.body;
    try {
        for (let i = 0; i < subject_ids.length; i++) {
            await pool.query(
                'INSERT INTO SubjectFacultyMapping (course_id, faculty_id) VALUES (?, ?)',
                [subject_ids[i], faculty_ids[i]]
            );
        }
        res.send('Mapping saved successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving mappings');
    }
});

// Start the Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});