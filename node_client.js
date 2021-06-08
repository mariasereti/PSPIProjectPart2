var admin = require('firebase-admin');
var firebase = require('firebase');
var express = require('express');
var bodyParser = require('body-parser');

const firebaseConfig = {
    apiKey: "AIzaSyAKRpQ9zg16Y5s68zkBSX_0lo0Yr9i_fQs",
    authDomain: "pspiproject.firebaseapp.com",
    databaseURL: "https://pspiproject-default-rtdb.firebaseio.com",
    projectId: "pspiproject",
    storageBucket: "pspiproject.appspot.com",
    messagingSenderId: "706683363662",
    appId: "1:706683363662:web:4ba9c21b95e130c1237e1f"
};

firebase.initializeApp(firebaseConfig);

var serviceAccount = require('./service_account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pspiproject-default-rtdb.firebaseio.com/"
})

console.log("Admin is initialized");


var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var PORT = process.env.PORT || 3000;

app.post('/signup', function (req, res) {
    console.log(req.body);

    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var surname = req.body.surname;

    console.log("Email: " + email);
    console.log("Password: " + password);

    signUpUser(email, password,name,surname, res);


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

function signUpUser(email, password,name,surname, res) {
    admin
        .auth()
        .createUser({
            email: email,
            emailVerified: false,
            password: password
        })
        .then((userRecord) => {


    var uid = userRecord.uid;
    console.log("Successfully created user:", uid);

    var database = admin.database();
    var usersRef = database.ref(/users/ + uid);

    usersRef.set({
        email: email,
        name : name,
        surname : surname,
        timestamp : new Date().getTime()
    })

    res.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify({response: "User created successfully with id: " + uid, code : 1, userID : uid, username : name} );
    res.end(json);

}).
    catch((error) => {
        console.log("Error fetching user data:", error.message);
    res.writeHead(400, {"Content-Type": "application/json"});
    var json = JSON.stringify({response: error.message, code : 2});
    res.end(json);
})
    ;
}

function signInUser(email, password, res) {
    firebase
        .auth()
        .signInWithEmailAndPassword(email,password)
        .then((userRecord) => {


    var uid = userRecord.user.uid;
    console.log("Successfully fetched user data:", uid);
    var database = admin.database();
    var usersRef = database.ref(/users/ + uid);

    usersRef.on("value", function (snapshot) {
        console.log(snapshot.val());
        console.log(snapshot.val().email);
        console.log(snapshot.val().name);
        console.log(snapshot.val().surname);
        console.log(snapshot.val().timestamp);

        res.writeHead(200, {"Content-Type": "application/json"});
        var json = JSON.stringify({response: "User signed in successfully", code : 1, userID : uid, username : name});
        res.end(json);

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


}).
    catch((error) => {
        console.log("Error fetching user data:", error.message);
    res.writeHead(400, {"Content-Type": "application/json"});
    var json = JSON.stringify({response: error.message, code : 2});
    res.end(json);
});

}