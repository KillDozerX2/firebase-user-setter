const fireAdmin = require('firebase-admin');
/**
 * adminAccountCredentials: object
 * usersConfig: object
 */
exports.FirebaseUserSetter = (adminAccountCredentials, usersConfig) => {
    return new Promise((resolve, reject) => {
        if (!adminAccountCredentials && !usersConfig) {
            reject(new Error(
                "The admin account credentials and the users configuration were not provided."
            ));
        }
        else if (!adminAccountCredentials) {
            reject(new Error(
                "The admin account credentials was not provided."
            ));
        }
        else if (!usersConfig) {
            reject(new Error(
                "The users configuration was not provided."
            ));
        }
        else {
            try {
                fireAdmin.initializeApp({
                    credential: fireAdmin.credential.cert(adminAccountCredentials)
                });
            }
            catch (Error) {
                reject(Error);
            }
            // This constant stores the forceUpdate option specified in the userConfig or sets it to false.
            const forceUpdateAll = usersConfig.forceUpdate || false;

            // This array stores Promises which will fetch user account from firebase
            const getUserAccountPromises = [];

            // The following will loop through the array containing users and fetch UserRecord from firebase.
            usersConfig.allUsers.forEach((account) => {
                getUserAccountPromises.push(
                    fireAdmin.auth().getUserByEmail(account.email)
                        .then((userRecord) => {
                            account.record = userRecord;
                            return account;
                        }).catch(() => {
                            account.record = null;
                            return account;
                        })
                );
            });
            Promise.all(getUserAccountPromises).then((userAccounts) => {
                // This array stores Promises which will create new user account in firebase.
                const createOrUpdateUserAccountPromises = [];
                userAccounts.forEach((account) => {
                    // Set the force update flag to either the value provided for idividual account in the config or to the global forceUpdateAll determined previously.
                    account.forceUpdate = account.forceUpdate || forceUpdateAll;

                    // Set the OAuth flag
                    account.UseOAuth = account.UseOAuth || false;

                    // Set the AccountInfo property
                    if (!account.accountInfo) {
                        account.fields = {
                            email: account.email
                        }
                    }
                    else {
                        account.fields = {
                            email: account.email,
                            password: account.password,
                            uid: account.accountInfo.uid,
                            emailVerified: account.accountInfo.emailVerified,
                            phoneNumber: account.accountInfo.phoneNumber,
                            displayName: account.accountInfo.displayName,
                            photoURL: account.accountInfo.photoURL,
                            disabled: account.accountInfo.disabled,
                            providerData: [account.providerData]
                        }
                    }


                    //  The following condition checks if the user account existed in firebase auth.
                    if (account.record === null) {
                        // Create a record in firebase auth.
                        if (account.UseOAuth === true) {
                            if (!account.providerData) {
                                console.error(`No providerData was given for user ${account.email}`);
                            }
                            else {
                                // Delete the password property from account.fields
                                delete account.fields.password;
                                // Create an account using OAuth provider
                                // Firebase only allows such accounts to be imported and not created.
                                createOrUpdateUserAccountPromises.push(
                                    fireAdmin.auth().importUsers([account.fields])
                                        .then((userRecord) => {
                                            account.record = userRecord;
                                            return account;
                                        })
                                        .catch(() => {
                                            console.error(`Could not import user - ${account.email} with OAuth provider`);
                                            account.record = null;
                                            return account;
                                        })
                                );
                            }
                        }
                        else {
                            // Create an account using Email and Password
                            if (!account.password) {
                                console.error(`A password was not provided for ${account.email}`)
                            }
                            else {
                                // Delete the providerData from fields
                                delete account.fields.providerData;
                                // Push the create user promise on the array.
                                createOrUpdateUserAccountPromises.push(
                                    fireAdmin.auth().createUser(account.fields)
                                        .then((userRecord) => {
                                            account.record = userRecord;
                                            return account;
                                        })
                                        .catch(() => {
                                            console.error(
                                                `Could not create user - ${account.email} with email and password`
                                            );
                                            account.record = null;
                                            return account;
                                        })
                                )
                            }
                        }
                    }
                    else {
                        // Check if forceUpdate flag is set to true or false
                        if (account.forceUpdate === true) {
                            // Push a new auth().updateUser promise to the array.
                            createOrUpdateUserAccountPromises.push(
                                //  Update the user account
                                fireAdmin.auth().updateUser(account.record.uid, account.fields)
                                    .then((updatedUserRecord) => {
                                        account.userRecord = updatedUserRecord;
                                        return account;
                                    })
                                    .catch(() => {
                                        console.error(
                                            `An error occured while updating user ${account.email}`
                                        );
                                        return account;
                                    })
                            );
                        }
                        else {
                            // Push an empty promise to the array if forceUpdate is false.
                            createOrUpdateUserAccountPromises.push(
                                Promise.resolve(account)
                            )
                        }
                    }
                });

                // Wait for all the promises in createOrUpdateUserAccountPromises to finish
                Promise.all(createOrUpdateUserAccountPromises).then((userAccounts) => {
                    const setCustomClaimsPromises = [];
                    userAccounts.forEach((account) => {
                        if (account.customClaims) {
                            setCustomClaimsPromises.push(
                                fireAdmin.auth().setCustomUserClaims(account.record.uid, account.customClaims).then(() => {
                                    console.log(`Custom claims for user ${account.email} were set successfully`);
                                }).catch(() => {
                                    console.log(`Custom claims for user ${account.email} could not be set`);
                                })
                            )
                        }
                        else {
                            console.log(`No custom claims were provided for user ${account.email}`);
                            setCustomClaimsPromises.push(
                                Promise.resolve()
                            )
                        }
                    });
                    Promise.all(setCustomClaimsPromises).then(() => {
                        resolve();
                    })
                });
            })
        }
    })
}