
    // "csv-parser": "^3.0.0",
    // "lodash": "^4.17.21"

const csv = require("csv-parser");
const { createReadStream, writeFileSync } = require("fs");
// const { knex } = require("../db");
const { chain } = require("lodash");

function getRecords() {
  return new Promise((resolve) => {
    const results = [];
    createReadStream(__dirname + "/" + "AGEEML_20215271042500.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
}

async function main() {
  const records = await getRecords();
  const states = chain(records)
    .keyBy((row) => row.Cve_Ent)
    .values()
    .map((row) => {
      return { key: row.Cve_Ent, name: row.Nom_Ent };
    })
    .sortBy("key")
    .value();

  const municipalities = chain(records)
    .keyBy((row) => `${row.Cve_Ent}-${row.Cve_Mun}`)
    .values()
    .map((row) => {
      return { key: row.Cve_Mun, name: row.Nom_Mun, stateKey: row.Cve_Ent };
    })
    .sortBy("key")
    .value();

  const localities = chain(records)
    .map((row) => {
      return {
        key: row.Cve_Loc,
        name: row.Nom_Loc,
        municipalityKey: row.Cve_Mun,
        stateKey: row.Cve_Ent,
      };
    })
    .sortBy("key")
    .value();

  writeFileSync(
    "catalog.json",
    JSON.stringify({ states, municipalities, localities:[] }, void 0, 0)
  );

  // await knex.transaction(async (transaction) => {
  //   const queryInterface = transaction;
  //   await queryInterface.batchInsert("states", states);
  //   await queryInterface.batchInsert("municipalities", municipalities);
  //   await queryInterface.batchInsert("localities", localities);
  //   return q1;
  // });
}
main().then(console.log).catch(console.log);
