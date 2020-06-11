'use strict';

const core = require('@actions/core');
const main = require("./dist/main");

try {
    // Get input provided by the user
    const credentials = JSON.parse(core.getInput('credentials'));
    const config = JSON.parse(core.getInput('config'));

    // Call the main promise
    main.FirebaseUserSetter(credentials, config).then(() => {
        process.exit(core.ExitCode.Success);
    }).catch((error) => {
        core.setFailed(error.message);
    });
}
catch (error) {
    core.setFailed(error.message);
    process.exit(core.ExitCode.Failure);
}
