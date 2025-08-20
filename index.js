import express from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log("Connected to database (via pool)");
});

pool.on('error', (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});


app.get("/", async(req, res) => {
  try{
    const listItems = await pool.query('Select * from items order by id asc;');
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
    const result = await pool.query('Insert into items(title) values($1) returning *;',[item])  
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
    await pool.query("Update items set title = $1 where id = $2;", [editItem, id]);
    res.redirect("/");
  }catch(err){
    console.log(err);
  }

});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId;
  console.log(id)
  try{
    await pool.query("Delete from items where id = $1",[id]);
    res.redirect('/');
  }catch(err){
    console.log(err);
  }
});

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

export default app;