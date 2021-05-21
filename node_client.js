var admin = require('firebase-admin');
var express = require('express');
var bodyParser = require('body-parser');

var serviceAccount = require('./service_account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pspiproject-default-rtdb.firebaseio.com/"
})

console.log("Admin is initialized");


var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var PORT = process.env.PORT || 3000;

app.post('/signup', function (req, res) {
    console.log(req.body);

    var email = req.body.email;
    var password = req.body.password;

    console.log("Email: " + email);
    console.log("Password: " + password);

    signUpUser(email, password, res);


});

app.post('/signin', function (req, res) {
    console.log(req.body);

    var email = req.body.email;
    var password = req.body.password;

    console.log("Email: " + email);
    console.log("Password: " + password);

    signInUser(email, password, res);

});


app.listen(PORT, function () {

    console.log("Started on PORT 3000");
});

function signUpUser(email, password, res) {
    admin
        .auth()
        .createUser({
            email: email,
            emailVerified: false,
            phoneNumber: '+11234567890',
            password: password
        })
        .then((userRecord) => {
        console.log("Successfully created user:", userRecord);

    var uid = userRecord.uid;

    var database = admin.database();
    var usersRef = database.ref(/users/ + uid);

    usersRef.set({
        email: email
    })

    res.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify({response: "User created successfully with id: " + uid});
    res.end(json);

}).
    catch((error) => {
        console.log("Error fetching user data:", error.message);
    res.writeHead(400, {"Content-Type": "application/json"});
    var json = JSON.stringify({response: error.message});
    res.end(json);
})
    ;
}

function signInUser(email, password, res) {
    admin
        .auth()
        .getUserByEmail(email)
        .then((userRecord) => {
        console.log("Successfully fetched user data:", userRecord);

    var uid = userRecord.uid;

    var database = admin.database();
    var usersRef = database.ref(/users/ + uid);

    usersRef.on("value", function (snapshot) {
        console.log(snapshot.val());
        console.log(snapshot.val().email);

        res.writeHead(200, {"Content-Type": "application/json"});
        var json = JSON.stringify({response: "User signed in successfully"});
        res.end(json);

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


}).
    catch((error) => {
        console.log("Error fetching user data:", error.message);
    res.writeHead(400, {"Content-Type": "application/json"});
    var json = JSON.stringify({response: error.message});
    res.end(json);
});

}