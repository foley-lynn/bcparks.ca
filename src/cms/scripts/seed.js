/*
 * Load initial data from the PAR API and then from local JSON files.
 */
const strapi = require("strapi");

const initialDataLoad = require("../data/functions/initialDataLoad.js");

strapi({ serveAdminPanel: false })
  .load()
  .then(async (app) => {
    try {
      await initialDataLoad.seedData();
    } catch (err) {
      app.log.error(`Error occurred seeding initial data`);
      app.log.error(err);
      process.exit(1);
    }

    // Node recommends against calling process.exit()
    // but it is how strapi scripts do it ¯\_(ツ)_/¯
    process.exit(0);
  });
