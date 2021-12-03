const express = require("express");
const pg = require("pg");
const app = express();
const port = 3000;
const json2csv = require("json2csv");

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
    } else if (overUnder === "<") {
      whereClauses.push(`age<$${param++}`);
      params.push(age);
    } else if (overUnder === ">") {
      whereClauses.push(`age>$${param++}`);
      params.push(age);
    } else if (overUnder === "<=") {
      whereClauses.push(`age<=$${param++}`);
      params.push(age);
    } else if (overUnder === ">=") {
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
    overUnderOptions: ["=", "<", "<=", ">", ">="],
  });
});

app.listen(3000, () => {
  console.log(`App running on http://localhost:${port}`);
});

//MEET!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
    whereClauses.push(`meet_date=$${param++}`);
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
    meet_date,
  });
});

//EVENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.get("/event", async (req, res) => {
  let param = 1;

  const { event_number, distance, sex, stroke, relay, overUnder, stroke_name } =
    req.query;

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
    } else if (overUnder === "<") {
      whereClauses.push(`distance<$${param++}`);
      params.push(distance);
    } else if (overUnder === ">") {
      whereClauses.push(`distance>$${param++}`);
      params.push(distance);
    } else if (overUnder === "<=") {
      whereClauses.push(`distance<=$${param++}`);
      params.push(distance);
    } else if (overUnder === ">=") {
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
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(
      " AND "
    )} order By event_number 
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
    overUnderOptions: ["=", "<", "<=", ">", ">="],
  });
});

//RESULTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.get("/results", async (req, res) => {
  let param = 1;

  const {
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
    } else if (overUnder === "<") {
      whereClauses.push(`distance<$${param++}`);
      params.push(distance);
    } else if (overUnder === ">") {
      whereClauses.push(`distance>$${param++}`);
      params.push(distance);
    } else if (overUnder === "<=") {
      whereClauses.push(`distance<=$${param++}`);
      params.push(distance);
    } else if (overUnder === ">=") {
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
    if ("medley".indexOf(stroke_name.toLowerCase()) >= 0) {
      whereClauses.push(`stroke_name='IM' AND relay='T'`);
    } else {
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
    } else if (sort === "Distance") {
      sortBy = "distance";
    } else if (sort === "Stroke") {
      sortBy = "stroke";
    } else if (sort === "Time") {
      sortBy = "time";
    } else if (sort === "") {
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
    ${whereClauses.length > 0 ? "WHERE " : ""} ${whereClauses.join(
      " AND "
    )} order By  ${sortBy} ${sortDir}`,
    params
  );

  rows.forEach((element) => {
    let mins = Math.floor(element["time"] / 6000);
    let seconds = Math.floor((element["time"] - 6000 * mins) / 100);
    if (seconds < 10) {
      seconds = "0" + seconds.toString();
    }
    let milliseconds = element["time"] % 100;
    if (milliseconds < 10) milliseconds = "0" + milliseconds.toString();

    var newTime;
    // console.log(`mins: ${mins}`)
    if (mins != "0") {
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
    sortDirectionOptions: ["Ascending", "Descending"],
  });
});

//edit!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get("/edit", async (req, res) => {

  const { fswimmer_athlete, lswimmer_athlete, sex_athlete, age_athlete, team_athlete, addRemoveAthlete,
    addRemoveMeet, addRemoveTeam, addRemoveResult, addRemoveEvent, team_name, team_code, meet_date,
    meet_location, meet_name, result_athlete, result_event, result_time, result_place, event_meet,
    event_number, event_distance, event_course, sex_event, event_stroke, event_team, event_relay, } = req.query;

  const athleteValues = [];
  const athleteParams = [];

  const meetValues = [];
  const meetParams = [];

  const teamValues = [];
  const teamParams = [];

  const resultValues = [];
  const resultParams = [];

  const eventValues = [];
  const eventParams = [];



  if (team_athlete !== undefined && !isNaN(team_athlete)) {
    athleteValues.push(`team=${team_athlete}`);
    athleteParams.push(team_athlete);
  }

  if (fswimmer_athlete !== undefined && fswimmer_athlete.trim().length > 0) {
    athleteValues.push(`first_name='${fswimmer_athlete}'`);
    athleteParams.push("'" + fswimmer_athlete + "'");
  }

  if (lswimmer_athlete !== undefined && lswimmer_athlete.trim().length > 0) {
    athleteValues.push(`last_name='${lswimmer_athlete}'`);
    athleteParams.push("'" + lswimmer_athlete + "'");
  }

  if (sex_athlete !== undefined) {
    if (sex_athlete === "male") {
      athleteValues.push(`sex='M'`);
      athleteParams.push(`'M'`);
    }
    if (sex_athlete === "female") {
      athleteValues.push(`sex='F'`);
      athleteParams.push(`'F'`);
    }
  }

  if (age_athlete !== undefined && age_athlete.trim().length > 0 && isNaN(age_athlete) == false) {
    athleteValues.push(`age=${age_athlete}`);
    athleteParams.push(age_athlete);
  }

  const { athletes } = await client.query(`SELECT * FROM ATHLETES`);

  const { teams } = await client.query(`SELECT * FROM TEAM`);

  if (addRemoveAthlete === "Add" && athleteParams.length == 5) {

    const { rows } = await client.query(
      `INSERT INTO ATHLETES (team, first_name, last_name, sex, age) VALUES (${athleteParams.join(", ")}) RETURNING *;`
    );
    if (rows) {
      res.redirect(`/?fswimmer=${fswimmer_athlete}&lswimmer=${lswimmer_athlete}&sex=${sex_athlete}`);
    }
  } else if (addRemoveAthlete === "Remove" && athleteValues.length > 0) {
    const { rows } = await client.query(`DELETE FROM ATHLETES WHERE (${athleteValues.join(" AND ")});`);
    if (rows) {
      res.redirect(`/`);
    }
  }

  //---------------------------------

  if (meet_name !== undefined && meet_name.trim().length > 0) {
    meetValues.push(`meet_name='${meet_name}'`)
    meetParams.push("'" + meet_name.toLowerCase() + "'");
  }

  if (meet_location !== undefined && meet_location.trim().length > 0) {
    meetValues.push(`meet_location='${meet_location}'`)
    meetParams.push("'" + meet_location.toLowerCase() + "'");
  }

  if (meet_date !== undefined && meet_date.trim().length > 0) {
    meetValues.push(`meet_date='${meet_date}'`)
    meetParams.push("'" + meet_date + "'");
  }

  if (addRemoveMeet === 'Add' && meetParams.length == 3) {
    const { rows } = await client.query(
      `INSERT INTO MEET (meet_name, meet_location, meet_date) VALUES (${meetParams.join(", ")}) RETURNING *;`
    );
    if (rows) {
      res.redirect(`/meets?meet_name=${meet_name}&meet_location=${meet_location}&meet_date=${meet_date}`);
    }
  }
  else if (addRemoveMeet === "Remove" && meetValues.length > 0) {
    const { rows } = await client.query(`DELETE FROM MEET WHERE (${meetValues.join(" AND ")});`);
    if (rows) {
      res.redirect(`/meets`)
    }
  }
  //-------------------------------------------------------
  if (event_meet !== undefined && event_meet.trim().length > 0) {
    eventValues.push(`meet='${event_meet}'`)
    eventParams.push("'" + event_meet.toLowerCase() + "'");
  }

  if (event_number !== undefined && event_number.trim().length > 0) {
    eventValues.push(`event_number='${event_number}'`)
    eventParams.push("'" + event_number.toLowerCase() + "'");
  }

  if (event_distance !== undefined && event_distance.trim().length > 0) {
    eventValues.push(`distance='${event_distance}'`)
    eventParams.push("'" + event_distance + "'");
  }
  if (event_course !== undefined && event_course.trim().length > 0) {
    eventValues.push(`course='${event_course}'`)
    eventParams.push("'" + event_course + "'");
  }

  if (sex_event !== undefined) {
    if (sex_event === "male") {
      athleteValues.push(`sex='M'`);
      athleteParams.push(`'M'`);
    }
    if (sex_event === "female") {
      athleteValues.push(`sex='F'`);
      athleteParams.push(`'F'`);
    }
  }

  if (event_stroke !== undefined && event_stroke.trim().length > 0) {
    eventValues.push(`stroke='${event_stroke}'`)
    eventParams.push("'" + event_stroke + "'");
  }
  if (event_team !== undefined && event_team.trim().length > 0) {
    eventValues.push(`team='${event_team}'`)
    eventParams.push("'" + event_team + "'");
  }

  if (event_relay !== undefined && event_relay !== "any") {
    if (event_relay === "Yes") {
      whereClauses.push(`relay='T'`);
    }
    if (relay === "No") {
      whereClauses.push(`relay='F'`);
    }
  }

  if (addRemoveEvent === 'Add' && eventParams.length == 8) {
    const { rows } = await client.query(
      `INSERT INTO EVENT (meet, event_number, distance, course, sex, stroke, relay) VALUES (${eventParams.join(", ")}) RETURNING *;`
    );
    if (rows) {
      res.redirect(`/event?event_number=${event_number}&overUnder=%3D&distance=${ditance}&sex=${sex}&stroke=${stroke}&relay=${relay}`);
    }
  }
  else if (addRemoveEvent === "Remove" && eventValues.length > 0) {
    const { rows } = await client.query(`DELETE FROM EVENT WHERE (${eventValues.join(" AND ")});`);
    if (rows) {
      res.redirect(`/event`)
    }
  }


  //----------------------------------------
  if (team_name !== undefined && team_name.trim().length > 0) {
    teamValues.push(`team_name='${team_name}'`)
    teamParams.push("'" + team_name.toLowerCase() + "'");
  }

  if (team_code !== undefined && team_code.trim().length > 0) {
    teamValues.push(`team_code='${team_code}'`)
    teamParams.push("'" + team_code.toLowerCase() + "'");
  }


  if (addRemoveTeam === 'Add' && teamParams.length == 2) {
    const { rows } = await client.query(
      `INSERT INTO TEAM (team_name, team_code) VALUES (${teamParams.join(", ")}) RETURNING *;`
    );
    if (rows) {
      res.redirect(`/`);
    }
  }
  else if (addRemoveTeam === "Remove" && teamValues.length > 0) {
    const { rows } = await client.query(`DELETE FROM TEAM WHERE (${teamValues.join(" AND ")});`);
    if (rows) {
      res.redirect(`/`)
    }
  }

  //---------------------------------------------------------

  if (result_athlete !== undefined && result_athlete.trim().length > 0) {
    resultValues.push(`result_athlete='${result_athlete}'`)
    resultParams.push("'" + result_athlete.toLowerCase() + "'");
  }

  if (result_event !== undefined && result_event.trim().length > 0) {
    resultValues.push(`result_event='${result_event}'`)
    resultParams.push("'" + result_event.toLowerCase() + "'");
  }
  if (result_time !== undefined && result_time.trim().length > 0) {
    resultValues.push(`result_time='${result_time}'`)
    resultParams.push("'" + result_time.toLowerCase() + "'");
  }
  if (result_place !== undefined && result_place.trim().length > 0) {
    resultValues.push(`result_place='${result_place}'`)
    resultParams.push("'" + result_place.toLowerCase() + "'");
  }

  if (addRemoveResult === 'Add' && resultParams.length == 4) {

    console.log(`INSERT INTO RESULTS (athlete, event_id, time, place) VALUES (${resultParams.join(", ")}) RETURNING *;`);


    const { rows } = await client.query(
      `INSERT INTO RESULTS (athlete, event_id, time, place) VALUES(${resultParams.join(", ")}) RETURNING *; `
    );
    if (rows) {
      res.redirect(`/results?event_number=${result_event}`);
    }
  }
  else if (addRemoveTeam === "Remove" && resultValues.length > 0) {
    const { rows } = await client.query(`DELETE FROM RESULTS WHERE(${resultValues.join(" AND ")}); `);
    if (rows) {
      res.redirect(`/ results`)
    }
  }


  res.render("pages/edit", {
    athletes: athletes,
    fswimmer_athlete,
    lswimmer_athlete,
    sex_athlete,
    team_athlete,
    age_athlete,
    addRemoveAthlete,
    addRemoveMeet,
    addRemoveTeam,
    addRemoveResult,
    addRemoveEvent,
    result_athlete,
    result_event,
    result_time,
    result_place,
    event_meet,
    event_number,
    event_distance,
    event_course,
    sex_event,
    event_stroke,
    event_team,
    event_relay,
    team_name,
    team_code,
    meet_date,
    meet_location,
    meet_name,
    sexOptions: ["male", "female"],
    teamOptions: [1],
    addRemoveOptions: ["Add", "Remove"],
    relayOptions: ["Yes", "No"],
  });
});
