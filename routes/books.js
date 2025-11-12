// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword)
});

router.get('/list', (req, res, next) => {
    let sqlquery = "SELECT * FROM books"
    db.query(sqlquery, (err, result) => {
        if(err) {
            console.log(err)
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
    });
});

router.get("/add-book", (req, res) => {
    res.render("addBook.ejs", {error:""})
})

router.post("/book-added", (req, res, next) => {
    let sqlQuery = "INSERT INTO BOOKS (name, price) VALUES (?,?)"
    let newRecord = [req.body.name, req.body.price]
    db.query(sqlQuery, newRecord, (err, result) => {
        if(err){
            res.render("addBook.ejs", {error:"Failed"})
        }
        else{
            res.send(`This book has been added to the database, name: ${req.body.name}
                price: ${req.body.price}`)
        }
    })
})
// Export the router object so index.js can access it
module.exports = router
