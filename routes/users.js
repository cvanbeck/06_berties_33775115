// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt');
const fs = require("fs")

// Encryption config
const saltRounds = 10;

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    const plainPassword = req.body.password;
    let hash;
    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
            res.send(err)
        }
        else {
            hash = hashedPassword
            let sqlQuery = "INSERT INTO userData (username, firstName, lastName, email, hashedPassword) VALUES (?, ?, ?, ?, ?)"
            let newRecord = [req.body.username, req.body.first, req.body.last, req.body.email, hash];
            db.query(sqlQuery, newRecord, (err, result) => {
                if (err) {
                    res.send(err)
                }
                else {
                    res.send(`Hello ${req.body.first} ${req.body.last} you are now registered!
                     We will send an email to you at ${req.body.email}. Your password is:
                     ${req.body.password} and your hashed password is: ${hash}
                    `)
                };
            });
        }
    });
});

router.get("/login", (req, res, next) => {
    res.render("login.ejs")
})

router.post("/loggedin", (req, res, next) => {
    let sqlQuery = "SELECT hashedPassword FROM userdata WHERE username = ?"
    db.query(sqlQuery, req.body.username, (err, result) => {
        if (err) {
            next(err)
        }   
        else if(result[0]) {
            bcrypt.compare(req.body.password, result[0].hashedPassword, async (err, result) => {
                if (err){next(err)}
                let query = "INSERT INTO login_attempts (username, outcome, time) VALUE (?, ?, NOW())"
                if (result == true) {
                    // We don't want these two functions to throw any errors if they fail, nor do we want them to hold up the logging in.
                    // Therefore we just let them run and allow the webapp to continue with logging in
                    db.query(query, [req.body.username, "Success"], (err, result) => { return })
                    res.send("Login successful")
                } else {
                    db.query(query, [req.body.username, "Failure"], (err, result) => { return })
                    res.send("Login unsuccesful")
                }
            })
        } 
        else {
            res.send("User not found")
        }
    })
})

router.get("/audit", (req, res, next) => {
    let sqlquery = "SELECT * FROM login_attempts"
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("audit.ejs", { attempts: result })
    });
})

router.get("/list", (req, res, next) => {
    let sqlquery = "SELECT username, firstName, lastName, email FROM userdata"
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("listUsers.ejs", { users: result })
    });
})

// Export the router object so index.js can access it
module.exports = router
