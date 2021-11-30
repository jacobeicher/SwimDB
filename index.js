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


//INDEX!!!!!!!!!!!!!!!!!!!
app.get("/", async (req, res) => {
  let param = 1;

  const { fswimmer, lswimmer, sex, overUnder, age, team } = req.query;

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
    if (overUnder === "=") {
      whereClauses.push(`age=$${param++}`);
      params.push(age);
    }
    else if (overUnder === "<") {
      whereClauses.push(`age<$${param++}`);
      params.push(age);
    }
    else if (overUnder === ">") {
      whereClauses.push(`age>$${param++}`);
      params.push(age);
    }
    else if (overUnder === "<=") {
      whereClauses.push(`age<=$${param++}`);
      params.push(age);
    }
    else if (overUnder === ">=") {
      whereClauses.push(`age>=$${param++}`);
      params.push(age);
    }
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
    overUnder,
    age,
    sexOptions: ["any", "male", "female"],
    teamOptions: ["any", "OU", "Other"],
    overUnderOptions: ["=", "<", "<=", ">", ">="]

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

//MEETS
app.get("/meets", async (req, res) => {
  let param = 1;

  const { meet_name, meet_location, meet_date } = req.query;

  const whereClauses = [];
  const params = [];

  if (meet_name !== undefined && meet_name.trim().length > 0) {
    whereClauses.push(`LOWER(meet_name) LIKE '%' || $${param++} || '%' `);
    params.push(meet_name.toLowerCase());
  }

  if (meet_location !== undefined && meet_location.trim().length > 0) {
    whereClauses.push(`LOWER(meet_Location) LIKE '%' || $${param++} || '%' `);
    params.push(meet_location.toLowerCase());
  }


  if (meet_date !== undefined && meet_date.trim().length > 0) {
    whereClauses.push(`meet_date LIKE '%' || $${param++} || '%' `);
    params.push(meet_date);
  }


  const { rows } = await client.query(
    `
    SELECT meet_name, meet_location, meet_date FROM MEET
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(" AND ")}
  `,
    params
  );

  res.render("pages/meet", {
    meet: rows,
    meet_name,
    meet_location,
    meet_date
  });
});

//EVENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.get("/event", async (req, res) => {
  let param = 1;

  const { event_number, distance, sex, stroke, relay, overUnder, stroke_name } = req.query;

  const whereClauses = [];
  const params = [];

  if (event_number !== undefined && event_number.trim().length > 0) {
    whereClauses.push(`event_number=$${param++}`);
    params.push(event_number);
  }

  if (distance !== undefined && distance.trim().length > 0) {
    if (overUnder === "=") {
      whereClauses.push(`distance=$${param++}`);
      params.push(distance);
    }
    else if (overUnder === "<") {
      whereClauses.push(`distance<$${param++}`);
      params.push(distance);
    }
    else if (overUnder === ">") {
      whereClauses.push(`distance>$${param++}`);
      params.push(distance);
    }
    else if (overUnder === "<=") {
      whereClauses.push(`distance<=$${param++}`);
      params.push(distance);
    }
    else if (overUnder === ">=") {
      whereClauses.push(`distance>=$${param++}`);
      params.push(distance);
    }
  }

  if (sex !== undefined && sex !== "any") {
    if (sex === "male") {
      whereClauses.push(`sex='M'`);
    }
    if (sex === "female") {
      whereClauses.push(`sex='F'`);
    }
  }

  if (stroke !== undefined && stroke.trim().length > 0) {
    whereClauses.push(`stroke=$${param++}`);
    params.push(stroke);
  }

  if (relay !== undefined && relay !== "any") {
    if (relay === "Yes") {
      whereClauses.push(`relay='T'`);
    }
    if (relay === "No") {
      whereClauses.push(`relay='F'`);
    }
  }

  whereClauses.push("meet=meet.meet_id AND event.stroke=stroke.stroke_id");

  const { rows } = await client.query(
    `
    SELECT event_number, distance, sex, stroke, relay, meet_name, stroke_name FROM event, meet, stroke  
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(" AND ")} order By event_number 
  `,
    params
  );

  res.render("pages/event", {
    event: rows,
    event_number,
    distance,
    sex,
    stroke,
    relay,
    overUnder,
    stroke_name,
    relayOptions: ["any", "Yes", "No"],
    sexOptions: ["any", "male", "female"],
    overUnderOptions: ["=", "<", "<=", ">", ">="]

  });
});

//RESULTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.get("/results", async (req, res) => {
  let param = 1;

  const { event_number, fswimmer, lswimmer, distance, sex, stroke, relay, overUnder, stroke_name, place, time } = req.query;

  const whereClauses = [];
  const params = [];

  if (event_number !== undefined && event_number.trim().length > 0) {
    whereClauses.push(`event_number=$${param++}`);
    params.push(event_number);
  }

  if (fswimmer !== undefined && fswimmer.trim().length > 0) {
    whereClauses.push(`LOWER(first_name) LIKE '%' || $${param++} || '%' `);
    params.push(fswimmer.toLowerCase());
  }

  if (lswimmer !== undefined && lswimmer.trim().length > 0) {
    whereClauses.push(`LOWER(last_name) LIKE '%' || $${param++} || '%' `);
    params.push(lswimmer.toLowerCase());
  }

  if (distance !== undefined && distance.trim().length > 0) {
    if (overUnder === "=") {
      whereClauses.push(`distance=$${param++}`);
      params.push(distance);
    }
    else if (overUnder === "<") {
      whereClauses.push(`distance<$${param++}`);
      params.push(distance);
    }
    else if (overUnder === ">") {
      whereClauses.push(`distance>$${param++}`);
      params.push(distance);
    }
    else if (overUnder === "<=") {
      whereClauses.push(`distance<=$${param++}`);
      params.push(distance);
    }
    else if (overUnder === ">=") {
      whereClauses.push(`distance>=$${param++}`);
      params.push(distance);
    }
  }

  if (sex !== undefined && sex !== "any") {
    if (sex === "male") {
      whereClauses.push(`athletes.sex='M'`);
    }
    if (sex === "female") {
      whereClauses.push(`athletes.sex='F'`);
    }
  }

  if (stroke !== undefined && stroke.trim().length > 0) {
    whereClauses.push(`stroke=$${param++}`);
    params.push(stroke);
  }

  if (relay !== undefined && relay !== "any") {
    if (relay === "Yes") {
      whereClauses.push(`relay='T'`);
    }
    if (relay === "No") {
      whereClauses.push(`relay='F'`);
    }
  }

  whereClauses.push("meet=meet.meet_id");
  whereClauses.push("event.stroke=stroke.stroke_id ");
  whereClauses.push("results.athlete=athletes.athlete_id");
  whereClauses.push("stroke.stroke_id=event.stroke");
  whereClauses.push("results.event_id=event.event_id");



  const { rows } = await client.query(
    `
    SELECT event_number, first_name, last_name, distance, athletes.sex, stroke, relay, meet_name, stroke_name, place, time FROM event, meet, athletes, results, stroke  
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(" AND ")} order By event_number 
  `,
    params
  );

  res.render("pages/results", {
    event: rows,
    event_number,
    fswimmer,
    lswimmer,
    distance,
    sex,
    stroke,
    relay,
    overUnder,
    stroke_name,
    place,
    time,
    relayOptions: ["any", "Yes", "No"],
    sexOptions: ["any", "male", "female"],
    overUnderOptions: ["=", "<", "<=", ">", ">="]

  });
});


app.get('/edit', (req, res) => {
  res.render('pages/edit', {});
});

// function fillTable(rows, fields, table) {
//   for (var i = 0; i < rows.length; i++) {
//     tr = dataTable.insertRow(-1);
//     for (var j = 0; j < fields.length; j++) {
//       cell = tr.insertCell(-1);
//       cell.innerHTML = rows[i][fields[j]];
//     }
//   }
// }

// function test() {
//   client
//     .query("SELECT NOW() as now")
//     .then((res) => console.log(res.rows[0]))
//     .catch((e) => console.error(e.stack));
// }

// function submitAthlete(Fname, Lname, sex, team, age) {
//   console.log("%s, %s, %s, $s, %s", Fname, Lname, sex, team, age);
//   dataTable = document.getElementById("Athletes");
//   document.getElementById("change").innerHTML = "";
//   fields = ["first_name", "last_name", "team_code", "sex", "age"];
//   //rows = sqlQueryResult
//   fillTable(rows, fields, dataTable);
//   console.log(dataTable);
// }


