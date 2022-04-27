const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const path = require("path");
const url = require("url");
const mysql = require("mysql");
var MongoClient = require("mongodb").MongoClient;
const ip = require("ip");
const {
    dialog
} = require("electron");

var dburl =
    "mongodb+srv://vps:Vps123@cluster0.yumk7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

let win;

function createWindow() {
    win = new BrowserWindow({
        // frame:false,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        maximize: true,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.maximize();
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "templates/student_login.html"),
            protocol: "file",
            slashes: true,
        })
    );

    win.webContents.openDevTools();
    win.on("closed", () => {
        win = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

function current_date() {
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    return year + "-" + month + "-" + date;
}

function current_time() {
    var date_ob = new Date();
    var hours = date_ob.getHours();
    var minutes = date_ob.getMinutes();
    var seconds = date_ob.getSeconds();
    var dateTime = hours + ":" + minutes + ":" + seconds;

    return dateTime;
}

// Login Student
ipcMain.on("login:student", function (e, name, password) {
    let username = name;
    let pass = password;
    let cip = ip.address();
    let date = current_date();
    let time = current_time();
    let user_status = true;
    let logout_time = null;

    MongoClient.connect(dburl, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = {
            name: username,
            password: pass,
        };
        dbo
            .collection("registered_students")
            .find(query)
            .toArray(function (err, result) {
                if (err) throw err;
                // console.log(result)
                if (result.length != 0) {
                    var myobj = {
                        name: username,
                        system_ip: cip,
                        user_status: user_status,
                        login_time: time,
                        login_date: date,
                        logout_time: logout_time,
                    };
                    dbo.collection("students").insertOne(myobj, function (err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                        db.close();
                        win.loadURL(
                            url.format({
                                pathname: path.join(__dirname, "templates/sign_up.html"),
                                protocol: "file",
                                slashes: true,
                            })
                        );
                    });
                } else {
                    dialog.showMessageBox(
                        new BrowserWindow({
                            show: false,
                            alwaysOnTop: true,
                        }), {
                            title: "Error",
                            buttons: ["Cancel"],
                            message: "Access Denied",
                            detail: "You Have Entered Wrong Username or Password!",
                        }
                    );
                }
            });
    });
});

// Register Student
ipcMain.on("register:student", function (e, name, password) {
    let username = name;
    let pass = password;

    MongoClient.connect(dburl, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = {
            name: username,
        };
        dbo
            .collection("registered_students")
            .find(query)
            .toArray(function (err, result) {
                if (err) throw err;
                // console.log(result)
                if (result.length === 0) {
                    var myobj = {
                        name: username,
                        password: pass,
                    };
                    if (username && pass) {
                        dbo
                            .collection("registered_students")
                            .insertOne(myobj, function (err, res) {
                                if (err) throw err;
                                console.log(name, password, "document inserted");
                                db.close();
                                win.loadURL(
                                    url.format({
                                        pathname: path.join(
                                            __dirname,
                                            "templates/student_login.html"
                                        ),
                                        protocol: "file",
                                        slashes: true,
                                    })
                                );
                            });
                    } else {
                        dialog.showMessageBox(
                            new BrowserWindow({
                                show: false,
                                alwaysOnTop: true,
                            }), {
                                title: "Error",
                                buttons: ["Cancel"],
                                message: "Input Field is Not Filled",
                                detail: "Username or Password is Not Filled.",
                            }
                        );
                    }
                } else {
                    dialog.showMessageBox(
                        new BrowserWindow({
                            show: false,
                            alwaysOnTop: true,
                        }), {
                            title: "Error",
                            buttons: ["Cancel"],
                            message: "User Already Exist",
                            detail: "Username Already Exist! Try again With Different Username.",
                        }
                    );
                }
            });
    });
});

// Login Teacher
ipcMain.on("login:teacher", function (e, name, password,purpose) {
    let username = name;
    let pass = password;
    let cip = ip.address();
    let date = current_date();
    let time = current_time();
    let user_status = true;
    let logout_time = null;

    MongoClient.connect(dburl, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = {
            name: username,
            password: pass,
        };
        dbo
            .collection("registered_teachers")
            .find(query)
            .toArray(function (err, result) {
                if (err) throw err;
                console.log(name, password, purpose)
                if (result.length != 0) {
                    var myobj = {
                        name: username,
                        system_ip: cip,
                        user_status: user_status,
                        purpose: purpose,
                        login_time: time,
                        login_date: date,
                        logout_time: logout_time,
                    };
                    dbo.collection("teachers").insertOne(myobj, function (err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                        db.close();
                        win.loadURL(
                            url.format({
                                pathname: path.join(__dirname, "templates/sign_up.html"),
                                protocol: "file",
                                slashes: true,
                            })
                        );
                    });
                } else {
                    dialog.showMessageBox(
                        new BrowserWindow({
                            show: false,
                            alwaysOnTop: true,
                        }), {
                            title: "Error",
                            buttons: ["Cancel"],
                            message: "Access Denied",
                            detail: "You Have Entered Wrong Username or Password!",
                        }
                    );
                }
            });
    });
});

// Register Teacher
ipcMain.on("register:teacher", function (e, name, password) {
    let username = name;
    let pass = password;

    MongoClient.connect(dburl, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = {
            name: username,
        };
        dbo
            .collection("registered_teachers")
            .find(query)
            .toArray(function (err, result) {
                if (err) throw err;
                console.log(result)
                if (result.length == 0) {
                    var myobj = {
                        name: username,
                        password: pass,
                    };
                    if (username && pass) {
                        dbo
                            .collection("registered_teachers")
                            .insertOne(myobj, function (err, res) {
                                if (err) throw err;
                                console.log(name, password,"document inserted");
                                db.close();
                                win.loadURL(
                                    url.format({
                                        pathname: path.join(
                                            __dirname,
                                            "templates/teacher_login.html"
                                        ),
                                        protocol: "file",
                                        slashes: true,
                                    })
                                );
                            });
                    } else {
                        dialog.showMessageBox(
                            new BrowserWindow({
                                show: false,
                                alwaysOnTop: true,
                            }), {
                                title: "Error",
                                buttons: ["Cancel"],
                                message: "Input Field is Not Filled",
                                detail: "Username or Password is Not Filled.",
                            }
                        );
                    }
                } else {
                    dialog.showMessageBox(
                        new BrowserWindow({
                            show: false,
                            alwaysOnTop: true,
                        }), {
                            title: "Error",
                            buttons: ["Cancel"],
                            message: "User Already Exist",
                            detail: "Username Already Exist! Try again With Different Username.",
                        }
                    );
                }
            });
    });
});

