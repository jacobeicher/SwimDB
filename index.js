const express = require("express");
const pg = require("pg");
const app = express();
const port = 3000;
const json2csv = require('json2csv');


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

  const { event_number, fswimmer, lswimmer, distance, sex, stroke, relay, overUnder, stroke_name, place, time, sort, sort_direction
  } = req.query;

  const whereClauses = [];
  const params = [];
  let sortBy = "event_number";
  let sortDir = "";

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

  if (stroke_name !== undefined && stroke_name.trim().length > 0) {

    if ("medley".indexOf((stroke_name).toLowerCase()) >= 0) {
      whereClauses.push(`stroke_name='IM' AND relay='T'`)

    }
    else {
      whereClauses.push(`LOWER(stroke_name) LIKE '%' || $${param++} || '%' `);
      params.push(stroke_name.toLowerCase());
    }


  }

  if (relay !== undefined && relay !== "any") {
    if (relay === "Yes") {
      whereClauses.push(`relay='T'`);
    }
    if (relay === "No") {
      whereClauses.push(`relay='F'`);
    }
  }

  if (sort !== undefined) {
    if (sort === "Event Number") {
      sortBy = "event_number";
    }
    else if (sort === "Distance") {
      sortBy = "distance";
    }
    else if (sort === "Stroke") {
      sortBy = "stroke";
    }
    else if (sort === "Time") {
      sortBy = "time";
    }
    else if (sort === "") {
      sortBy = "";
    }
  }

  if (sort_direction !== undefined) {
    if (sort_direction === "Ascending") {
      sortDir = "";
    }
    if (sort_direction === "Descending") {
      sortDir = "DESC";
    }
  }


  whereClauses.push("meet=meet.meet_id");
  whereClauses.push("event.stroke=stroke.stroke_id ");
  whereClauses.push("results.athlete=athletes.athlete_id");
  whereClauses.push("stroke.stroke_id=event.stroke");
  whereClauses.push("results.event_id=event.event_id");



  const { rows } = await client.query(
    `SELECT event_number, first_name, last_name, distance, athletes.sex, stroke, relay, meet_name, stroke_name, place, time::varchar(255) FROM event, meet, athletes, results, stroke  
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(" AND ")} order By  ${sortBy} ${sortDir}`,
    params
  );


  rows.forEach(element => {
    let mins = Math.floor(element["time"] / 6000);
    let seconds = Math.floor((element["time"] - (6000 * mins)) / 100);
    if (seconds < 10) {
      seconds = "0" + seconds.toString();
    }
    let milliseconds = element["time"] % 100;
    if (milliseconds < 10)
      milliseconds = "0" + milliseconds.toString();

    // console.log(element["time"].toString());
    // console.log("mins: " + mins.toString())
    // console.log("seconds: " + seconds.toString());
    // console.log("milliseconds: " + milliseconds.toString());
    var newTime;
    // console.log(`mins: ${mins}`)
    if (mins != '0') {
      newTime = mins + ":";
    } else {
      newTime = "";
    }
    newTime += seconds + ".";
    newTime += milliseconds;
    // console.log(`newTime: ${newTime}`);
    element["time"] = newTime;
  });




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
    sort,
    sort_direction,
    relayOptions: ["any", "Yes", "No"],
    sexOptions: ["any", "male", "female"],
    overUnderOptions: ["=", "<", "<=", ">", ">="],
    sortOptions: ["Event Number", "Distance", "Stroke", "Time"],
    sortDirectionOptions: ["Ascending", "Descending"]
  });
});

app.get("/edit", async (req, res) => {
  let param = 1;

  const { fswimmer, lswimmer, sex, age, team } = req.query;

  const values = [];
  const params = [];

  if (fswimmer !== undefined && fswimmer.trim().length > 0) {
    values.push(`$${param++}`);
    params.push(fswimmer);
  }

  if (lswimmer !== undefined && lswimmer.trim().length > 0) {
    values.push(`$${param++}`);
    params.push(lswimmer);
  }

  if (sex !== undefined) {
    if (sex === "male") {
      values.push(`${param++}`);
      values.push(`M`);
    }
    if (sex === "female") {
      values.push(`${param++}`);
      values.push(`F`);
    }
  }

  if (team !== undefined) {
    values.push(`${param++}`);
    params.push(team);
  }

  if (age !== undefined && age.trim().length > 0) {
    values.push(`${param++}`);
    params.push(age);
  }

  const { rows } = await client.query(
    `INSERT INTO ATHETES VALUES(${values.join(", ")})`, params);


  res.render("pages/edit", {
    athletes: rows,
    fswimmer,
    lswimmer,
    sex,
    team,
    age,
    sexOptions: ["male", "female"],
    teamOptions: ["SCOU"],

  });
});


