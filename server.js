const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise'); // Use the promise-based API
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { format } = require('date-fns'); // Ensure date-fns is installed
const { formatWithOptions } = require('util');

const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'images' directory
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Directory for your EJS templates

// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust based on your needs
  host: 'localhost',
  user: 'root',
  password: 'Mysql',
  database: 'OBE'
});

// Test MySQL connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to the database');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit process if unable to connect
  });

// Login
app.get('/', async (req, res) => {
  const message = req.session.message || ''; // Get the message from session or set to empty string
  req.session.message = null; // Clear the message from the session
  res.render('login', { title: 'Login', message: message });
});

// Login
app.post('/login', async (req, res) => {
    const { facultyID, password } = req.body;
    console.log(facultyID,password)
    try {
      // Query the database for the user based on Faculty ID
      const [results] = await pool.query('SELECT * FROM Users WHERE faculty_id = ?', [facultyID]);
  
      if (results.length === 0) {
        req.session.message = 'Invalid Faculty ID';
        return res.redirect('/'); // Redirect to login with message
      }
  
      const user = results[0];
      const currentPassword = user.password;
  
      // Check if the provided password is the default "12"
      if (password === '12') {
        // If the stored password is also "12" (plaintext), hash and update it
        if (currentPassword === '12') {
          const hashedPassword = await bcrypt.hash(password, 10);
  
          try {
            await pool.query('UPDATE Users SET Password = ? WHERE faculty_id = ?', [hashedPassword, facultyID]);
            console.log('Default password hashed and updated in the database.');
          } catch (err) {
            console.error('Error updating hashed password:', err);
            req.session.message = 'An error occurred while updating your password. Please try again.';
            return res.redirect('/'); // Redirect with error message
          }
        } else {
          // Check if the stored password (hashed) matches the default "12"
          const isDefaultPasswordValid = await bcrypt.compare('12', currentPassword);
          if (!isDefaultPasswordValid) {
            req.session.message = 'Invalid Password';
            return res.redirect('/'); // Redirect to login with message
          }
        }
  
        // Log in the user after successful validation and potential update
        req.session.user = user;
        return res.redirect('/dashboard');
      }
  
      // For non-default passwords, verify using bcrypt
      const isPasswordValid = await bcrypt.compare(password, currentPassword);
      if (isPasswordValid) {
        req.session.user = user; // Log in the user
        return res.redirect('/dashboard');
      } else {
        req.session.message = 'Invalid Password';
        return res.redirect('/'); // Redirect to login with message
      }
    } catch (err) {
      console.error('Error handling login:', err);
      req.session.message = 'An unexpected error occurred. Please try again later.';
      return res.redirect('/'); // Redirect with error message
    }
  });

// logout
app.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});



// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
  