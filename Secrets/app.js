import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const db = new pg.Client({
    user : 'POSTGRES_USERNAME',
    database : 'DATABASE_NAME',
    password : 'PASSWORD',
    host : 'localhost',
    port : 5432
});
db.connect();

app.get("/", (req,res) => {
    res.render("home.ejs");
});

app.get("/login", (req,res) => {
    res.render("login.ejs");
});

app.get("/register", (req,res) => {
    res.render("register.ejs");
});

app.post("/register", async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    await db.query("INSERT INTO user_details VALUES ($1,$2)",[username,password]);
    res.render("secrets.ejs");
});

app.post("/login", async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    const result = await db.query("SELECT * FROM user_details WHERE username = $1",[username]);
    
    if(result.rows[0].username === username && result.rows[0].password === password)
        res.render("secrets.ejs");
});

app.listen(port, () => {
    console.log(`Server started at https://localhost:${port}`);
});