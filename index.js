const express = require("express");
const pg = require("pg");
const app = express();
const port = 3000;

app.use(express.static(__dirname));

const client = new pg.Client({
  user: "swim_admin",
  host: "swim-database.cu0wrflv9nhw.us-east-1.rds.amazonaws.com",
  database: "postgres",
  password: "givemeanachad",
  port: "5432",
});

client.connect();

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  let param = 1;

  const { fswimmer, lswimmer, sex, age, team } = req.query;

  const whereClauses = [];
  const params = [];

  if (fswimmer !== undefined && fswimmer.trim().length > 0) {
    whereClauses.push(`LOWER(first_name) LIKE '%' || $${param++} || '%' `);
    params.push(fswimmer.toLowerCase());
  }

  if (lswimmer !== undefined && lswimmer.trim().length > 0) {
    whereClauses.push(`LOWER(last_name) LIKE '%' || $${param++} || '%' `);
    params.push(lswimmer.toLowerCase());
  }

  if (sex !== undefined && sex !== "any") {
    if (sex === "male") {
      whereClauses.push(`sex='M'`);
    }
    if (sex === "female") {
      whereClauses.push(`sex='F'`);
    }
  }

  if (team !== undefined && team !== "any") {
    whereClauses.push(`team_code=$${param++}`);
    params.push(team);
  }

  if (age !== undefined && age.trim().length > 0) {
    whereClauses.push(`age=$${param++}`);
    params.push(age);
  }

  const { rows } = await client.query(
    `
    SELECT first_name, last_name, sex, age, team_code FROM ATHLETES, TEAM
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(" AND ")}
  `,
    params
  );

  res.render("pages/index", {
    athletes: rows,
    fswimmer,
    lswimmer,
    sex,
    team,
    age,
    sexOptions: ["any", "male", "female"],
    teamOptions: ["any", "OU", "Other"],
  });
});

// router.get("/", (req, res) => {
//   res.sendFile("index.html");
//   fields = ["first_name", "last_name", "team_code", "sex", "age"];
// });

// app.use("/", router);

app.listen(3000, () => {
  console.log(`App running on http://localhost:${port}`);
});

function fillTable(rows, fields, table) {
  for (var i = 0; i < rows.length; i++) {
    tr = dataTable.insertRow(-1);
    for (var j = 0; j < fields.length; j++) {
      cell = tr.insertCell(-1);
      cell.innerHTML = rows[i][fields[j]];
    }
  }
}

function test() {
  client
    .query("SELECT NOW() as now")
    .then((res) => console.log(res.rows[0]))
    .catch((e) => console.error(e.stack));
}

function submitAthlete(Fname, Lname, sex, team, age) {
  console.log("%s, %s, %s, $s, %s", Fname, Lname, sex, team, age);
  dataTable = document.getElementById("Athletes");
  document.getElementById("change").innerHTML = "";
  fields = ["first_name", "last_name", "team_code", "sex", "age"];
  //rows = sqlQueryResult
  fillTable(rows, fields, dataTable);
  console.log(dataTable);
}
