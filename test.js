const main = require("./main");
const credentials = require("./credentials.json");
const config = require("./config.json");

// Call the main promise
main.FirebaseUserSetter(credentials, config).then(() => {
    process.exit();

}).catch((error) => {
    console.error(error.message);
    process.exit();
})