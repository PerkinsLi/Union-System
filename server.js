var express = require('express');
var _ = require('lodash');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: 'http://localhost:8000'}));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var users = [
    { id: 1, name: "ava", password: "abc123_" },
    { id: 2, name: "walle", password: "abc123_" },
    { id: 3, "name": "marvin", password: "abc123_" },
];

var members = [
    { id: 1, chineseName: "Brian Sun1", englishName: "Brian1", gender: 'male', idNumber: '310115198201000001', mobile: '13817598754', email: 'email_sap1000001@disney.com' },
    { id: 2, chineseName: "Brian Sun2", englishName: "Brian2", gender: 'female', idNumber: '310115198201000002', mobile: '13817598755', email: 'email_sap1000002@disney.com' },
    { id: 3, chineseName: "Brian Sun3", englishName: "Brian3", gender: 'male', idNumber: '310115198201000003', mobile: '13817598756', email: 'email_sap1000003@disney.com' },
    { id: 4, chineseName: "Brian Sun4", englishName: "Brian4", gender: 'male', idNumber: '310115198201000004', mobile: '13817598757', email: 'email_sap1000004@disney.com' },
    { id: 5, chineseName: "Brian Sun5", englishName: "Brian5", gender: 'female', idNumber: '310115198201000005', mobile: '13817598754', email: 'email_sap1000005@disney.com' },
    { id: 6, chineseName: "Brian Sun6", englishName: "Brian6", gender: 'male', idNumber: '310115198201000006', mobile: '13817598754', email: 'email_sap1000006@disney.com' },
    { id: 7, chineseName: "Brian Sun7", englishName: "Brian7", gender: 'male', idNumber: '310115198201000007', mobile: '13817598710', email: 'email_sap1000007@disney.com' },
    { id: 8, chineseName: "Brian Sun8", englishName: "Brian8", gender: 'female', idNumber: '310115198201000008', mobile: '13817598712', email: 'email_sap1000008@disney.com' },
    { id: 9, chineseName: "Brian Sun9", englishName: "Brian9", gender: 'male', idNumber: '310115198201000009', mobile: '13817598754', email: 'email_sap1000009@disney.com' },
    { id: 10, chineseName: "Brian Sun10", englishName: "Brian10", gender: 'male', idNumber: '310115198201000010', mobile: '13817598754', email: 'email_sap1000010@disney.com' },
    { id: 11, chineseName: "Brian Sun11", englishName: "Brian11", gender: 'male', idNumber: '310115198201000011', mobile: '13817598754', email: 'email_sap1000011@disney.com' },
    { id: 12, chineseName: "Brian Sun1", englishName: "Brian1", gender: 'male', idNumber: '310115198201000001', mobile: '13817598754', email: 'email_sap1000001@disney.com' },
    { id: 13, chineseName: "Brian Sun2", englishName: "Brian2", gender: 'female', idNumber: '310115198201000002', mobile: '13817598755', email: 'email_sap1000002@disney.com' },
    { id: 14, chineseName: "Brian Sun3", englishName: "Brian3", gender: 'male', idNumber: '310115198201000003', mobile: '13817598756', email: 'email_sap1000003@disney.com' },
    { id: 15, chineseName: "Brian Sun4", englishName: "Brian4", gender: 'male', idNumber: '310115198201000004', mobile: '13817598757', email: 'email_sap1000004@disney.com' },
    { id: 16, chineseName: "Brian Sun5", englishName: "Brian5", gender: 'female', idNumber: '310115198201000005', mobile: '13817598754', email: 'email_sap1000005@disney.com' },
    { id: 17, chineseName: "Brian Sun6", englishName: "Brian6", gender: 'male', idNumber: '310115198201000006', mobile: '13817598754', email: 'email_sap1000006@disney.com' },
    { id: 18, chineseName: "Brian Sun7", englishName: "Brian7", gender: 'male', idNumber: '310115198201000007', mobile: '13817598710', email: 'email_sap1000007@disney.com' },
    { id: 19, chineseName: "Brian Sun8", englishName: "Brian8", gender: 'female', idNumber: '310115198201000008', mobile: '13817598712', email: 'email_sap1000008@disney.com' },
    { id: 20, chineseName: "Brian Sun9", englishName: "Brian9", gender: 'male', idNumber: '310115198201000009', mobile: '13817598754', email: 'email_sap1000009@disney.com' },
    { id: 21, chineseName: "Brian Sun10", englishName: "Brian10", gender: 'male', idNumber: '310115198201000010', mobile: '13817598754', email: 'email_sap1000010@disney.com' },
    { id: 22, chineseName: "Brian Sun11", englishName: "Brian11", gender: 'male', idNumber: '310115198201000011', mobile: '13817598754', email: 'email_sap1000011@disney.com' },
    { id: 23, chineseName: "Brian Sun1", englishName: "Brian1", gender: 'male', idNumber: '310115198201000001', mobile: '13817598754', email: 'email_sap1000001@disney.com' },
    { id: 24, chineseName: "Brian Sun2", englishName: "Brian2", gender: 'female', idNumber: '310115198201000002', mobile: '13817598755', email: 'email_sap1000002@disney.com' },
    { id: 25, chineseName: "Brian Sun3", englishName: "Brian3", gender: 'male', idNumber: '310115198201000003', mobile: '13817598756', email: 'email_sap1000003@disney.com' },
    { id: 26, chineseName: "Brian Sun4", englishName: "Brian4", gender: 'male', idNumber: '310115198201000004', mobile: '13817598757', email: 'email_sap1000004@disney.com' },
    { id: 27, chineseName: "Brian Sun5", englishName: "Brian5", gender: 'female', idNumber: '310115198201000005', mobile: '13817598754', email: 'email_sap1000005@disney.com' },
    { id: 28, chineseName: "Brian Sun6", englishName: "Brian6", gender: 'male', idNumber: '310115198201000006', mobile: '13817598754', email: 'email_sap1000006@disney.com' },
    { id: 29, chineseName: "Brian Sun7", englishName: "Brian7", gender: 'male', idNumber: '310115198201000007', mobile: '13817598710', email: 'email_sap1000007@disney.com' },
    { id: 30, chineseName: "Brian Sun8", englishName: "Brian8", gender: 'female', idNumber: '310115198201000008', mobile: '13817598712', email: 'email_sap1000008@disney.com' },
    { id: 31, chineseName: "Brian Sun9", englishName: "Brian9", gender: 'male', idNumber: '310115198201000009', mobile: '13817598754', email: 'email_sap1000009@disney.com' },
    { id: 32, chineseName: "Brian Sun10", englishName: "Brian10", gender: 'male', idNumber: '310115198201000010', mobile: '13817598754', email: 'email_sap1000010@disney.com' },
    { id: 33, chineseName: "Brian Sun11", englishName: "Brian11", gender: 'male', idNumber: '310115198201000011', mobile: '13817598754', email: 'email_sap1000011@disney.com' },
    { id: 34, chineseName: "Brian Sun1", englishName: "Brian1", gender: 'male', idNumber: '310115198201000001', mobile: '13817598754', email: 'email_sap1000001@disney.com' },
    { id: 35, chineseName: "Brian Sun2", englishName: "Brian2", gender: 'female', idNumber: '310115198201000002', mobile: '13817598755', email: 'email_sap1000002@disney.com' },
    { id: 36, chineseName: "Brian Sun3", englishName: "Brian3", gender: 'male', idNumber: '310115198201000003', mobile: '13817598756', email: 'email_sap1000003@disney.com' },
    { id: 37, chineseName: "Brian Sun4", englishName: "Brian4", gender: 'male', idNumber: '310115198201000004', mobile: '13817598757', email: 'email_sap1000004@disney.com' },
    { id: 38, chineseName: "Brian Sun5", englishName: "Brian5", gender: 'female', idNumber: '310115198201000005', mobile: '13817598754', email: 'email_sap1000005@disney.com' },
    { id: 39, chineseName: "Brian Sun6", englishName: "Brian6", gender: 'male', idNumber: '310115198201000006', mobile: '13817598754', email: 'email_sap1000006@disney.com' },
    { id: 40, chineseName: "Brian Sun7", englishName: "Brian7", gender: 'male', idNumber: '310115198201000007', mobile: '13817598710', email: 'email_sap1000007@disney.com' },
    { id: 41, chineseName: "Brian Sun8", englishName: "Brian8", gender: 'female', idNumber: '310115198201000008', mobile: '13817598712', email: 'email_sap1000008@disney.com' },
    { id: 42, chineseName: "Brian Sun9", englishName: "Brian9", gender: 'male', idNumber: '310115198201000009', mobile: '13817598754', email: 'email_sap1000009@disney.com' },
    { id: 43, chineseName: "Brian Sun10", englishName: "Brian10", gender: 'male', idNumber: '310115198201000010', mobile: '13817598754', email: 'email_sap1000010@disney.com' },
    { id: 44, chineseName: "Brian Sun11", englishName: "Brian11", gender: 'male', idNumber: '310115198201000011', mobile: '13817598754', email: 'email_sap1000011@disney.com' },
];

app.get('/api/getMembersCount', function (req, res) {
    res.json(members.length);
});

app.post('/api/login', upload.array(), function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var user;
    if (username && password) {
        user = _.find(users, { 'name': username });
        if (user.password === password) {
            res.json(user.id);
            return;
        }
    }
    res.json(false);
});

app.post('/api/getMembers', upload.array(), function (req, res) {
    var pageIndex = +req.body.pageIndex, pageSize = +req.body.pageSize;
    var result = [];
    if (pageIndex > 0 && pageSize > 0) {
        var startIndex = Math.max(0, Math.round(pageIndex - 1)) * pageSize;
        result = _.slice(members, startIndex, startIndex + pageSize);
    }

    res.json(result);
});

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})