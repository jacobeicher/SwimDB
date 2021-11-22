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

client.query("select * from athletes", (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.log(res.rows);
    console.log(res.rows[1]["last_name"]);
    // console.log(res.fields.map((field) => field.name)); // ['first_name', 'last_name']
    // console.log(res.rows[0]); // ['Brian', 'Carlson']
  }
});

function submit(Fname, Lname, sex, team, age) {
  console.log("%s, %s, %s, $s, %s", Fname, Lname, sex, team, age);
  dataTable = document.getElementById("Athletes");
  document.getElementById('change').innerHTML = "";
  fields = ["first_name", "last_name", "team", "sex", "age"];

  for (var i = 0; i < rows.length; i++) {
    tr = dataTable.insertRow(-1);
    for (var j = 0; j < fields.length; j++) {
      cell = tr.insertCell(-1);
      cell.innerHTML = rows[i][fields[j]]
    }
  }
  console.log(dataTable);
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
