import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const { Pool } = pg;

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

db.on('connect', () => {
  console.log("Connected to database (via pool)");
});

db.on('error', (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});


app.get("/", async(req, res) => {
  try{
    const listItems = await db.query('Select * from items order by id asc;');
    const items = listItems.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  }catch(err){
    console.log(err);
  }
});

app.post("/add", async(req, res) => {
  try{
    const item = req.body.newItem;
    const result = await db.query('Insert into items(title) values($1) returning *;',[item])  
    res.redirect("/");
  }catch(err){
    console.log(err);
  }
});

app.post("/edit", async(req, res) => {
  try{
    const editItem = req.body.updatedItemTitle;
    const id = req.body.updatedItemId;
    console.log(editItem)
    console.log
    await db.query("Update items set title = $1 where id = $2;", [editItem, id]);
    res.redirect("/");
  }catch(err){
    console.log(err);
  }

});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId;
  console.log(id)
  try{
    await db.query("Delete from items where id = $1",[id]);
    res.redirect('/');
  }catch(err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
