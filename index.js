const express = require("express");
const router = express.Router();
const pg = require("pg");

const client = new pg.Pool({
  user: "swim_admin",
  host: "swim-database.cu0wrflv9nhw.us-east-1.rds.amazonaws.com",
  database: "postgres",
  password: "givemeanachad",
  port: "5432",
});

client.query("select * from meet", (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.log(res.rows[0]);
    // console.log(res.fields.map((field) => field.name)); // ['first_name', 'last_name']
    // console.log(res.rows[0]); // ['Brian', 'Carlson']
  }
});

function submit(Fname, Lname, sex, team, age) {
  console.log("%s, %s, %s, $s, %s", Fname, Lname, sex, team, age);
  // dataTable = document.getElementById("Athletes");
  var table = document.createElement("table");
  // table.createCaption().innerHTML = "";
  for( var i = 0; i < rows.length;i++){

  }
  tr = dataTable.insertRow(-1);
  cell = tr.insertCell(-1);
  cell.innerHTML = Fname;

  cell = tr.insertCell(-1);
  cell.innerHTML = Lname;

  cell = tr.insertCell(-1);
  cell.innerHTML = team;

  cell = tr.insertCell(-1);
  cell.innerHTML = sex;

  cell = tr.insertCell(-1);
  cell.innerHTML = age;

  console.log(dataTable);
  document.getElementById("Athletes") = table; 
}

/* GET quotess listing. */
router.get("/", function (req, res, next) {
  res.json({
    data: [
      {
        quote: "First, solve the problem. Then, write the code.",
        author: "John Johnson",
      },
    ],
    meta: {
      page: 1,
    },
  });
});

module.exports = router;