![Ensure fulfillment](https://github.com/KillDozerX2/firebase-user-setter/workflows/Ensure%20fulfillment/badge.svg)

# Automatically set Default Users and Custom Roles for your firebase project in your CI/CD pipeline.
Firebase User Setter allows you to add default users directly to your project, you can also use it to set custom claims directly from you CI/CD pipeline.  
Although Firebase allows you to set users directly from the console, but that functionality is only limited to email/password. Also the console does not allow you to create custom claims.  
I created Firebase User Setter specifically to be able to add custom claims directly in my CD pipeline and later decided to publish it.

## Inputs
* `credentials` - **Required**  
    Firebase User Setter uses firebase admin, so you will have to provide a service account json object. You can get it from the firebase console by clicking on the gear icon next to the Project Overview on the top of the sidebar. Select Project settings -> Service accounts. Select the Node.js version not others. Ideally you would want to keep it into your repository secrets.
* `config` - **Required**  
    An array containing users you wish to be added, modified or set custom claims to. An example of the users array will look like this.
    ```javascript
    {
        // This is an array containing user objects of users you wish to add.
        allUsers: [
            {
                email: "test@test.com",
                // Required.
                //The user's primary email. Must be a valid email address.
                // The email is used to check if the user already exists.
                
                // Firebase User Setter allows you to either create users using  email and password or to import them from an OAuth provider. To import users from OAuth Providers. The following flag must be set to true.
                UseOAuth: true,
                // The default value is false.

                
                password: "testPassword1234",
                // If you set the previous UseOAuth flag to true, this will be ignored. If you did not specifically set the UseOAuth flag to true. Firebase User Setter will print an error to the console but won't raise an error.


                providerData: {
                    uid: 'google-uid',
                    // This is not related to the uid in firebase but instead comes from the OAuth provider themselves.

                    email: 'johndoe@gmail.com',
                    // The email to use, this should technically be the same as the account but I haven't tested the contrary.

                    displayName: 'John Doe',
                    // The displayName associated with the Identity provided.

                    photoURL: 'http://www.example.com/12345678/photo.png',
                    // The photoURL associated with the Identity provider.

                    providerId: 'google.com'
                    // The id of the provider.
                },
                // If you set the UseOAuth flag to true, Firebase User Setter will print a console error if this information is not provided.


                // This is the information related to the Firebase Authentication Account. The following link will specify what information can be added.
                // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
                accountInfo: {
                    uid: "10214464120199982",
                    // Optional.
                    // The uid to assign to only the newly created user. Must be a string between 1 and 128 characters long, inclusive. 
                    // If not provided, a random uid will be automatically generated
                    

                    emailVerified: true,
                    // Whether or not the user's primary email is verified. If not provided, the default is false.

                    phoneNumber: "9051112222",
                    // The user's primary phone number. Must be a valid E.164 spec compliant phone number.

                    displayName: "Himanshu Pant",
                    // The users' display name.

                    photoURL: "http://www.example.com/12345678/photo.png",
                    // The url of the user's profile image

                    disabled: false,
                    // Whether or not the user is disabled. true for disabled; false for enabled. If not provided, the default is false.
                },
                
                forceUpdate: true,
                // Set this flag to true if you wish this individual user account Info to be updated.

                
                // The following object should contain claims that you wish to add to the user.
                customClaims: {
                    testRoleFlag: true,
                }
            }
        ],
        // This is a flag which will update the user account if it already exists for all the users you have provided.
        // Default is false.
        // The following page will show you what can be updated.
        // https://firebase.google.com/docs/auth/admin/manage-users#update_a_user
        // You can also set the flag individually in the user object.
        forceUpdate: Boolean
    }
    ```

## Usage
Adds or updates users to Firebase Auth and/or adds custom claims
```yml
<your_job_name>:
  runs-on: <your_os_of_choice>
  steps:
    - name: Add or update default users to firebase auth and/or set custom claims.
      uses: KillDozerX2/firebase-user-setter@v1
      with:
        credentials: ${{ secrets.THE_NAME_OF_REPO_SECRET_CONTAINING_ADMIN_ACCOUNT_CREDENTIALS }}
        config: ${{ secrets.THE_NAME_OF_REPO_SECRET_CONTAINING_CONFIG }}
```

## Recommendation
Please store the Admin Account credentials json and the config into secrets on your repository, you can use any other names for those secrets.