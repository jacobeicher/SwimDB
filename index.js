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
  whereClauses.push('ATHLETES.team=TEAM.team_id');
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
    } else if (sort === "Place") {
      sortBy = "place";
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
    if (mins != "0") {
      newTime = mins + ":";
    } else {
      newTime = "";
    }
    newTime += seconds + ".";
    newTime += milliseconds;
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
    sortOptions: ["Event Number", "Distance", "Stroke", "Time", "Place"],
    sortDirectionOptions: ["Ascending", "Descending"],
  });
});

//edit!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function match(name, code, val) {
  for (x = 0; x < name.length; x++) {
    if (name[x] === val)
      return code[x];
  }
}



app.get("/edit", async (req, res) => {

  const { fswimmer_athlete, lswimmer_athlete, sex_athlete, age_athlete, athlete_team, addRemoveAthlete,
    addRemoveMeet, addRemoveTeam, addRemoveResult, addRemoveEvent, team_name, team_code, meet_date,
    meet_location, meet_name, result_athlete, result_event, result_time_min, result_time_sec, result_time_milsec, result_place, event_meet,
    event_number, event_distance, event_course, sex_event, event_stroke, event_relay, result_meet } = req.query;

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


  const athletes = [];
  const athletesIDs = []
  const teams = [];
  const teamIDs = [];
  const meets = [];
  const meetIDs = [];

  const strokes = [];
  const strokeIDs = [];

  const eventIDs = [];

  await client.query(`SELECT * FROM ATHLETES;`, (err, res) => {
    if (err) {
      console.log("oops Database Error");
    } else {
      res.rows.forEach(x => {
        athletes.push(x['first_name'] + " " + x['last_name']);
        athletesIDs.push(x['athlete_id']);
      })
    }
  });


  client.query(`SELECT * FROM TEAM;`, (err, res) => {
    if (err) {
      console.log("oops Database Error");
    } else {
      res.rows.forEach(x => {
        teams.push(x['team_name']);
        teamIDs.push(x['team_id']);
      })
    }
  });

  client.query(`SELECT * FROM MEET;`, (err, res) => {
    if (err) {
      console.log("oops Database Error");
    } else {
      res.rows.forEach(x => {
        meets.push(x['meet_name']);
        meetIDs.push(x['meet_id']);
      })
    }
  });

  client.query(`SELECT * FROM STROKE;`, (err, res) => {
    if (err) {
      console.log("oops Database Error");
    } else {
      res.rows.forEach(x => {
        strokes.push(x['stroke_name']);
        strokeIDs.push(x['stroke_id']);
      })
    }
  });

  client.query(`SELECT event_id, meet, event_number FROM event;`, (err, res) => {
    if (err) {
      console.log("oops Database Error");
    } else {
      res.rows.forEach(x => {
        eventIDs.push({ event_id: x['event_id'], event_number: x['event_number'], meet: x['meet'] })
      })
    }
  });


  const { teams2 } = await client.query(`SELECT * FROM TEAM`); // idk why we cant delete this 


  let resp;

  if (athlete_team !== undefined) {

    resp = match(teams, teamIDs, athlete_team);
    athleteValues.push(`team=${resp}`);
    athleteParams.push(resp);
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


  if (age_athlete !== undefined && age_athlete.trim().length > 0 && !isNaN(age_athlete)) {
    athleteValues.push(`age=${age_athlete}`);
    athleteParams.push(age_athlete);
  }


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
    const val = match(meets, meetIDs, event_meet);
    eventValues.push(`meet='${val}'`)
    eventParams.push("'" + val + "'");
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
    if (event_course === "Yards") {
      eventValues.push(`course='Y'`)
      eventParams.push("'Y'");
    }
    else {
      eventValues.push(`course='M'`)
      eventParams.push("'M'");
    }
  }

  if (sex_event !== undefined) {
    if (sex_event === "male") {
      eventValues.push(`sex='M'`);
      eventParams.push(`'M'`);
    }
    if (sex_event === "female") {
      eventValues.push(`sex='F'`);
      eventParams.push(`'F'`);
    }
  }

  if (event_stroke !== undefined && event_stroke.trim().length > 0) {
    const val = match(strokes, strokeIDs, event_stroke);
    console.log(val);
    eventValues.push(`stroke='${val}'`)
    eventParams.push("'" + val + "'");
  }


  if (event_relay !== undefined) {

    if (event_relay === "Yes") {
      eventValues.push(`relay='T'`);
      eventParams.push(`'T'`);
    }
    if (event_relay === "No") {
      eventValues.push(`relay='F'`);
      eventParams.push(`'F'`);
    }
  }
  console.log(eventParams.join(" "));
  if (addRemoveEvent === 'Add' && eventParams.length == 7) {
    const { rows } = await client.query(
      `INSERT INTO EVENT (meet, event_number, distance, course, sex, stroke, relay) VALUES (${eventParams.join(", ")}) RETURNING *;`
    );
    if (rows) {
      res.redirect(`/event?event_number=${event_number}&distance=${event_distance}&sex=${sex_event}&stroke=${match(strokes, strokeIDs, event_stroke)}&relay=${event_relay}`);
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

    const val = match(athletes, athletesIDs, result_athlete);
    resultValues.push(`athlete='${val}'`)
    resultParams.push("'" + val + "'");
  }

  eventIDs.forEach(x => {
    if (x["event_number"] === parseInt(result_event, 10) && x["meet"] === match(meets, meetIDs, result_meet)) {
      resultValues.push(`event_id='${x['event_id']}'`)
      resultParams.push("'" + x["event_id"] + "'");
    }
  })

  if (result_time_min !== undefined && result_time_min.trim().length > 0 && !isNaN(result_time_min)) {
    if (result_time_sec !== undefined && result_time_sec.trim().length > 0 && !isNaN(result_time_sec)) {
      if (result_time_milsec !== undefined && result_time_milsec.trim().length > 0 && !isNaN(result_time_milsec)) {

        let time = parseInt(result_time_min) * 60;
        console.log(time);

        time = (parseInt(time) + parseInt(result_time_sec)) * 100;
        console.log(time);

        time += parseInt(result_time_milsec);

        console.log(time);

        resultValues.push(`time='${time}'`)
        resultParams.push("'" + time + "'");
      }
    }
  }

  if (result_place !== undefined && result_place.trim().length > 0) {
    resultValues.push(`place='${result_place}'`)
    resultParams.push("'" + result_place + "'");
  }

  if (addRemoveResult === 'Add' && resultParams.length == 4) {
    const { rows } = await client.query(
      `INSERT INTO RESULTS (athlete, event_id, time, place) VALUES(${resultParams.join(", ")}) RETURNING *; `
    );
    if (rows) {
      res.redirect(`/results?event_number=${result_event}`);
    }
  }
  else if (addRemoveResult === "Remove" && resultValues.length > 0) {

    const { rows } = await client.query(`DELETE FROM RESULTS WHERE(${resultValues.join(" AND ")}); `);
    if (rows) {
      res.redirect(`/results`)
    }
  }

  res.render("pages/edit", {
    fswimmer_athlete,
    lswimmer_athlete,
    sex_athlete,
    athlete_team,
    age_athlete,
    addRemoveAthlete,
    addRemoveMeet,
    addRemoveTeam,
    addRemoveResult,
    addRemoveEvent,
    result_athlete,
    result_event,
    result_time_min,
    result_time_sec,
    result_time_milsec,
    result_place,
    result_meet,
    event_meet,
    event_number,
    event_distance,
    event_course,
    sex_event,
    event_stroke,
    event_relay,
    team_name,
    team_code,
    meet_date,
    meet_location,
    meet_name,
    sexOptions: ["male", "female"],
    teamOptions: teams,
    addRemoveOptions: ["Add", "Remove"],
    relayOptions: ["Yes", "No"],
    athleteOptions: athletes,
    meetOptions: meets,
    strokeOptions: strokes,
    courseOptions: ['Yards', 'Meters']
  });
});
