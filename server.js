const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "petly_db"
});

db.connect((err) => {
    if (err) { console.error("Database connection failed:", err); return; }
    console.log("Connected to MySQL");
});

// ========================================
// VETS
// ========================================

// GET - Retrieve all vets
app.get("/api/vets", (req, res) => {
    db.query("SELECT * FROM vets ORDER BY name", (err, results) => {
        if (err) return res.status(500).json({ 
            message: "Database error"
        });
        res.json(results);
    });
});

// POST - Add a vet
app.post("/api/vets", (req, res) => {
    const { name, specialization, phone, email } = req.body;
    db.query(
        "INSERT INTO vets (name, specialization, phone, email) VALUES (?, ?, ?, ?)",
        [name, specialization, phone, email],
        (err, result) => {
            if (err) return res.status(500).json({ 
                message: "Database error" 
            });
            res.status(201).json({ 
                message: "Vet added", id: result.insertId 
            });
        }
    );
});

// PUT - Update a vet
app.put("/api/vets/:id", (req, res) => {
    const { name, specialization, phone, email } = req.body;
    db.query(
        "UPDATE vets SET name=?, specialization=?, phone=?, email=? WHERE id=?",
        [name, specialization, phone, email, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ 
                message: "Database error" 
            });
            res.json({ 
                message: "Vet updated" 
            });
        }
    );
});

// DELETE - Remove a vet
app.delete("/api/vets/:id", (req, res) => {
    db.query("DELETE FROM vets WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ 
            message: "Database error" 
        });
        res.json({ 
            message: "Vet deleted" 
        });
    });
});

// ========================================
// PATIENTS
// ========================================

// GET - Retrieve all patients
app.get("/api/pets", (req, res) => {
    db.query("SELECT * FROM pets ORDER BY name", (err, results) => {
        if (err) return res.status(500).json({ 
            message: "Database error" 
        });
        res.json(results);
    });
});

// POST - Add a patient
app.post("/api/pets", (req, res) => {
    const { name, species, breed, age, bio, owner } = req.body;
    db.query(
        "INSERT INTO pets (name, species, breed, age, bio, owner) VALUES (?, ?, ?, ?, ?, ?)",
        [name, species, breed, age, bio, owner],
        (err, result) => {
            if (err) return res.status(500).json({ 
                message: "Database error" 
            });
            res.status(201).json({ 
                message: "Patient added", id: result.insertId 
            });
        }
    );
});

// PUT - Update a patient
app.put("/api/pets/:id", (req, res) => {
    const { name, species, breed, age, bio, owner } = req.body;
    db.query(
        "UPDATE pets SET name=?, species=?, breed=?, age=?, bio=?, owner=? WHERE id=?",
        [name, species, breed, age, bio, owner, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ 
                message: "Database error" 
            });
            res.json({ 
                message: "Patient updated" 
            });
        }
    );
});

// DELETE - Remove a patient
app.delete("/api/pets/:id", (req, res) => {
    db.query("DELETE FROM pets WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ 
            message: "Database error" 
        });
        res.json({ 
            message: "Patient deleted" 
        });
    });
});

// ========================================
// APPOINTMENTS
// ========================================

// GET - Retrieve all appointments
app.get("/api/appointments", (req, res) => {
    const sql = `
        SELECT appointments.*, pets.name AS pet_name, pets.species AS pet_species, pets.owner AS pet_owner
        FROM appointments
        JOIN pets ON appointments.pet_id = pets.id
        ORDER BY appointments.date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ 
            message: "Database error" 
        });
        res.json(results);
    });
});

// POST - Add an appointment
app.post("/api/appointments", (req, res) => {
    const { pet_id, date, reason, notes, status } = req.body;
    db.query(
        "INSERT INTO appointments (pet_id, date, reason, notes, status) VALUES (?, ?, ?, ?, ?)",
        [pet_id, date, reason, notes || null, status || "Scheduled"],
        (err, result) => {
            if (err) return res.status(500).json({ 
                message: "Database error" 
            });
            res.status(201).json({ 
                message: "Appointment created", id: result.insertId 
            });
        }
    );
});

// PUT - Update an appointment
app.put("/api/appointments/:id", (req, res) => {
    const { date, reason, notes, status } = req.body;
    db.query(
        "UPDATE appointments SET date=?, reason=?, notes=?, status=? WHERE id=?",
        [date, reason, notes || null, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ 
                message: "Database error" });
            res.json({ 
                message: "Appointment updated" 
            });
        }
    );
});

// DELETE - Remove an appointment
app.delete("/api/appointments/:id", (req, res) => {
    db.query("DELETE FROM appointments WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ 
            message: "Database error" });
        res.json({ 
            message: "Appointment deleted" 
        });
    });
});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
