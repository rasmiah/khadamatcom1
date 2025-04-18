const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const cors = require('cors');
const bcrypt = require("bcryptjs");
//const passport = require("passport");
//const { Strategy } = require("passport-local");
//const session = require("express-session");
const dotenv = require("dotenv");
require('dotenv').config();
const getConnection = require('./db-config');




const app = express();
const port = 4000;
const saltRounds = 10;

const path = require('path');

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(express.json());
app.use(cors( {
  origin: '*',  // Allow requests from any origin for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'] // Ensure the proper headers are allowed
}));
/*app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());*/


//Test connection with DB
const db = getConnection();
db.connect((err) => {
  if (err) {console.error('Error connecting to the database:', err.stack);}
  else{console.log("Connected to DataBase!");}
  db.query(`SELECT * FROM users`, (err, results) => {console.log(results.rows);});
});




  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.get("/", (req, res) => {
    res.render("HomePage.jsx");
  });

  app.get("/Login", (req, res) => {
    res.render("Login.jsx");
  });

  app.get("/Join", (req, res) => {
    res.render("Join.jsx");
  });

  /*app.post(
    "/Login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
  );*/

  app.post("/Join", async (req, res) => {
    const {firstname, lastName, nationalID, email, phone, location,  password, confirmPassword, birthDate, gender, userType, services }= req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
  }
  if (!nationalID) {
      return res.status(400).json({ error: "National ID is required." });
  }
  if (!firstname) {
    return res.status(400).json({ error: "First name is required." });
}
if (!lastName) {
    return res.status(400).json({ error: "Last name is required." });
}

if (firstname.length < 3) {
  return res.status(400).json({ error: "First name must be at least 3 characters long." });
}
if (lastName.length < 3) {
  return res.status(400).json({ error: "Last name must be at least 3 characters long." });
}


  // Validate Email Format (must contain "@" and ".")
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format. Please enter a valid email address." });
  }

  // Validate National ID (must be exactly 10 digits)
  const nationalIDRegex = /^\d{10}$/;
  if (!nationalIDRegex.test(nationalID)) {
      return res.status(400).json({ error: "Invalid National ID. It must be exactly 10 digits." });
  }
  const phoneRegex = /^\d{10,13}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Please enter valid phone number." });
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: "Password must contain at least one letter, one number, and one special character, and be at least 8 characters long."
        });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
  }

    const normalizedGender = gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : '';

    //const normalizedUserType = userType ? userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase() : '';

    const validRoles = ["client", "worker", "admin"];
    const normalizedUserType = userType ? userType.toLowerCase() : '';
    
    if (!validRoles.includes(normalizedUserType)) {
        return res.status(400).json({ error: "Invalid role. Allowed roles: client, worker, admin." });
    }


    if (!firstname || !lastName || !nationalID || !email || !phone || !location || !password || !confirmPassword || !birthDate || !gender || !userType) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
    }
  
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = ( "INSERT INTO users (firstname, lastname, nationalid, email, governorate, phone, password, birthdate, gender, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *; "  ) ;

        const values = [ firstname, lastName, nationalID, email, location, phone, hashedPassword, birthDate, normalizedGender, normalizedUserType];

        


        const result = await db.query(query, values);

        res.status(201).json({
            message: "Registration successful!",
            user: result.rows[0],
        });

      
    } catch (err) {
        console.error("Error saving user:", err);
        if (err.code === "23505") { // PostgreSQL unique constraint violation
            res.status(400).json({ error: "Email or National ID already exists." });
        } else {
            res.status(500).json({ error: "An error occurred. Please try again." });
        }
    }
   
  });



  app.post("/Login", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
  
    try {
      // Query the database to find user by email
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
  
        // Check if the password matches

        const isPasswordCorrect = await bcrypt.compare(password, storedPassword);


        if (isPasswordCorrect) {
          // Respond with success and user data
          res.status(200).json({ message: "Login successful", username: email });
        } else {
          // Incorrect password
          res.status(400).json({ message: "Incorrect password" });
        }
      } else {
        // User not found
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  /*app.post('/Join', (req, res) => {
    console.log('Request received:', req.body);
  });*/
  
  

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });