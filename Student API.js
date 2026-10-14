
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

const file = path.join(__dirname, "students.json");

// Load students from JSON file
function loadStudents() {
    if (!fs.existsSync(file)) {
        return [];
    }

    const text = fs.readFileSync(file, "utf8");

    if (!text.trim()) {
        return [];
    }

    return JSON.parse(text);
}

// Save students to JSON file
function saveStudents(students) {
    const text = JSON.stringify(students, null, 2);

    fs.writeFileSync(file, text);
}

// Home route
app.get("/", function (req, res) {
    res.send("Hello! My Student Management API is working");
});

// GET: Get all students
app.get("/students", function (req, res) {
    res.json(loadStudents());
});

// GET: Get a student by ID
app.get("/students/:id", function (req, res) {
    const id = Number(req.params.id);

    const students = loadStudents();

    const student = students.find(function (s) {
        return s.id === id;
    });

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.json(student);
});

// POST: Add a new student
app.post("/students", function (req, res) {
    const body = req.body || {};

    const { name, email, program } = body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof program !== "string" || !program.trim()
    ) {
        return res.status(400).json({
            message: "Name, email, and program are required"
        });
    }

    if (!email.includes("@")) {
        return res.status(400).json({
            message: "Email is not valid"
        });
    }

    const students = loadStudents();

    const last = students[students.length - 1];

    const id = last ? Math.max(...students.map(s => s.id)) + 1 : 1;

    const student = {
        id: id,
        name: name.trim(),
        email: email.trim(),
        program: program.trim()
    };

    students.push(student);

    saveStudents(students);

    res.status(201).json({
        message: "Student added successfully",
        student: student
    });
});

// PUT: Update a student by ID
app.put("/students/:id", function (req, res) {
    const id = Number(req.params.id);

    const students = loadStudents();

    const student = students.find(function (s) {
        return s.id === id;
    });

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const { name, email, program } = req.body || {};

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name must be a non-empty string"
            });
        }

        student.name = name.trim();
    }

    if (email !== undefined) {
        if (
            typeof email !== "string" ||
            !email.trim().includes("@")
        ) {
            return res.status(400).json({
                message: "Email is not valid"
            });
        }

        student.email = email.trim();
    }

    if (program !== undefined) {
        if (typeof program !== "string" || !program.trim()) {
            return res.status(400).json({
                message: "Program must be a non-empty string"
            });
        }

        student.program = program.trim();
    }

    saveStudents(students);

    res.json({
        message: "Student updated successfully",
        student: student
    });
});

// DELETE: Delete a student by ID
app.delete("/students/:id", function (req, res) {
    const id = Number(req.params.id);

    const students = loadStudents();

    const index = students.findIndex(function (s) {
        return s.id === id;
    });

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    students.splice(index, 1);

    saveStudents(students);

    res.json({
        message: "Student deleted successfully"
    });
});

// Start server
app.listen(3000, function () {
    console.log("Running at http://localhost:3000");
});
