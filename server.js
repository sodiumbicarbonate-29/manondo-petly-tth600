const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

/*

npm init -y
npm install express mysql2

*/

// Allow JSON data
app.use(express.json());


// Serve index.html
app.use(express.static(__dirname));


// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "petly_db"
});


db.connect((err) => {

    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    console.log("Connected to MySQL");

});


// ========================================
// GET - Retrieve Pets
// ========================================

app.get("/api/pets", (req, res) => {
    const sql = "SELECT * FROM pets";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);

    });

});



// ========================================
// POST - Insert Pet
// ========================================

app.post("/api/pets", (req, res) => {
    const name = req.body.name;
    const species = req.body.species;
    const breed = req.body.breed;
    const age = req.body.age;
    const bio = req.body.bio;
    const owner = req.body.owner;

    const sql = `
        INSERT INTO pets
        (name, species, breed, age, bio, owner)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, species, breed, age, bio, owner],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }


            res.status(201).json({
                message: "Pet added successfully",
                id: result.insertId
            });

        }
    );

});

// ========================================
// DELETE - Remove Pet
// ========================================


// ========================================
// GET - Retrieve Posts
// ========================================

app.get("/api/posts", (req, res) => {

    const sql = `
        SELECT posts.*, pets.name AS pet_name, pets.species AS pet_species
        FROM posts
        JOIN pets ON posts.pet_id = pets.id
        ORDER BY posts.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);

    });

});


// ========================================
// POST - Insert Post
// ========================================
app.post("/api/posts", (req, res) => {

    const pet_id = req.body.pet_id;
    const caption = req.body.caption;
    const mood = req.body.mood;

    const sql = `
        INSERT INTO posts
        (pet_id, caption, mood)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [pet_id, caption, mood],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.status(201).json({
                message: "Post added successfully",
                id: result.insertId
            });
        }
    );

});
// ========================================
// DELETE - Remove Post
// ========================================

// ========================================
// GET - Retrieve Buddy Requests (joined with both pet names)
// ========================================
app.get("/api/requests", (req, res) => {

    const sql = `
        SELECT
            buddy_requests.*,
            fromPet.name AS from_name,
            toPet.name AS to_name
        FROM buddy_requests
        JOIN pets AS fromPet ON buddy_requests.from_pet_id = fromPet.id
        JOIN pets AS toPet ON buddy_requests.to_pet_id = toPet.id
        ORDER BY buddy_requests.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);

    });

});


// ========================================
// POST - Insert Buddy Request
// ========================================

app.post("/api/requests", (req, res) => {

    const from_pet_id = req.body.from_pet_id;
    const to_pet_id = req.body.to_pet_id;

    const sql = `
        INSERT INTO buddy_requests
        (from_pet_id, to_pet_id)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [from_pet_id, to_pet_id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.status(201).json({
                message: "Request sent successfully",
                id: result.insertId
            });

        }
    );

});



// ========================================
// DELETE - Remove Buddy Request (Decline / Remove)
// ========================================


// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});