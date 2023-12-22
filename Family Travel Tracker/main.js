import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "POSTGRES_USERNAME",
  host: "localhost",
  database: "DATABASE_NAME",
  password: "PASSWORD",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1",[currentUserId]);
  let countries = [];
  (result.rows).forEach((country) =>{
    countries.push(country.country_code);
  });
  return countries;
}

async function checkUser(){
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

app.get("/", async (req,res) => {
  const countries = await checkVisited();
  const users = await checkUser();
  res.render("index.ejs", {
    countries: countries,
    users: users,
    color: users[currentUserId-1].color,
    total: countries.length,
  });
});

app.post("/delete", async (req,res) => {
  await db.query("DELETE FROM visited_countries WHERE id > 0");
  await db.query("DELETE FROM users WHERE id > 1 ");
  currentUserId = 1;
  res.redirect("/");
})

app.post("/add", async (req,res) => {
  let country = req.body.country;
  try{
    const response = await db.query("SELECT country_code FROM country WHERE LOWER(country_name) LIKE $1 || '%'",[country.toLowerCase()]);
    const data = response.rows[0];
    const countryCode = data.country_code;
    try{  
      await db.query("INSERT INTO visited_countries(country_code,user_id) VALUES ($1,$2)", [countryCode,currentUserId]);
      res.redirect("/");
    } catch(error) {
      console.log(error);
    }
  } catch(error) {
    console.log(error);
  }
});

app.post("/user", async (req,res) => {
  if(req.body.user){
    currentUserId = req.body.user;
    res.redirect("/");
  }
  else
    res.render("new.ejs");
});

app.post("/new", async (req,res) => {
  const users = await checkUser();
  currentUserId = users.length+1;
  await db.query("INSERT INTO users VALUES ($1,$2,$3)",[currentUserId,req.body.name,req.body.color]);
  res.redirect("/");
});

app.listen(port,() => {
  console.log(`Server started at https://localhost:${port}`);
});