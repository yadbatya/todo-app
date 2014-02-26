var http = require('http');
var main = require('./main');
c = console.log
var requests = [];
var options = [];
var testsDone = 0;
var testSessionId;

//test 1
var body1 = '{"username":"user1","fullname":"user levy","password":"pass1"}\n';
options.push({
    host: 'localhost',
    port: '3000',
    path: '/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body1.length
    }
});

requests.push(function(cb) {
    var req1 = http.request(options[0], function (res) {
        if (res.statusCode !== 200) {
            console.log("test1.1: failed. failed to register new user");
        }
        if (!res.headers['set-cookie']) {
            console.log("test1.1: failed. didn't receive a sessionId cookie");
        }
        else {
            console.log("test1.1: good");
        }
        cb();
    });

    req1.write(body1);
    req1.end();
})

var body2 = '{"username":"user1","fullname":"user cohen","password":"pass2"}\n'
options.push({
    host: 'localhost',
    port: '3000',
    path: '/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body2.length
    }
});

requests.push(function(cb){
    var req2 = http.request(options[1], function (res) {
        if (res.statusCode !== 500) {
            console.log("test1.2: failed. registered 2 users with the same username");
        }
        if (res.headers['set-cookie']) {
            console.log("test1.2: failed. received a sessionId cookie, even though register wasn't legal");
        }
        else {
            console.log("test1.2: good");
        }
        cb();
    });
    req2.write(body2);
    req2.end();
});


//test 2
var body3 = '{"username":"user1","password":"pass1"}\n';
options.push({
    host: 'localhost',
    port: '3000',
    path: '/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body3.length
    }
});

requests.push(function(cb) {
    var req3 = http.request(options[2], function (res) {
        if (res.statusCode !== 200) {
            console.log("test2.1: failed. failed to login to an existing user");
        }
        if (!res.headers['set-cookie']) {
            console.log("test2.1: failed. didn't receive a sessionId cookie");
        }
        else {
            var str = res.headers['set-cookie'][0];
            testSessionId = str.substring(str.indexOf('=') + 1, str.indexOf(';'));
            console.log("test2.1: good");
        }
        cb();
    });
    req3.write(body3)
    req3.end();
});

var body4 = '{"username":"user1","password":"pass2"}\n'
options.push({
    host: 'localhost',
    port: '3000',
    path: '/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body4.length
    }
});
requests.push(function(cb) {
    var req4 = http.request(options[3], function (res) {
        if (res.statusCode !== 500) {
            console.log("test2.2: failed. managed to login with wrong password");
        }
        if (res.headers['set-cookie']) {
            console.log("test2.2: failed. received a sessionId cookie, even though login wasn't legal");
        }
        else {
            console.log("test2.2: good");
        }
        cb();
    });
    req4.write(body4)
    req4.end();
});


//test 3
options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'GET'
});

requests.push(function(cb) {
    options[4].headers = {
        'Cookie': 'sessionId=' + testSessionId
    }
    var req5 = http.request(options[4], function (res) {
        res.on('data', function(data) {
            if (JSON.stringify(JSON.parse(data.toString()).items) !== '{}') {
                console.log("test3: the todo list was supposed to be empty, and wasn't.");
            }
            else {
                console.log("test3: good");
            }
            cb();
        });
    });
    req5.end();
});

//test 4
var body5 = '{"id":"1","value":"item1"}\n'
options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body5.length
    }
});

requests.push(function(cb) {
    options[5].headers['Cookie'] = 'sessionId=' + testSessionId;
    var req6 = http.request(options[5], function (res) {
        res.on('data', function(data) {
            if (JSON.parse(data.toString()).status !== 0) {
                console.log("test4.1: failed adding item to the list");
            }
            else {
                console.log("test4.1: good");
            }
            cb();
        });
    });
    req6.write(body5);
    req6.end();
});

var body6 = '{"id":"1","value":"item2"}\n'
options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body6.length
    }
});

requests.push(function(cb) {
    options[6].headers['Cookie'] = 'sessionId=' + testSessionId;
    var req7 = http.request(options[6], function (res) {
        if (res.statusCode !== 500) {
            console.log("test4.2: failed. added item with ID that already exists");
        }
        else {
            console.log("test4.2: good");
        }
        cb();
    });
    req7.write(body6);
    req7.end();
});

var body7 = '{"id":"1","value":"item1changed","status":"1"}\n'
options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': body7.length
    }
});

requests.push(function(cb) {
    options[7].headers['Cookie'] = 'sessionId=' + testSessionId;
    var req8 = http.request(options[7], function (res) {
        res.on('data', function(data) {
            if (JSON.parse(data.toString()).status !== 0) {
                console.log("test5: failed updating item in the list");
            }
            else {
                console.log("test5: good");
            }
            cb();
        });
    });
    req8.write(body7);
    req8.end();
});

var body8 = '{"id":-1}\n'
options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'DELETE',
    headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'Content-Length': body8.length
    }
});

requests.push(function(cb) {
    options[8].headers['Cookie'] = 'sessionId=' + testSessionId;
    var req9 = http.request(options[8], function (res) {
        res.on('data', function(data) {
            if (JSON.parse(data.toString()).status !== 0) {
                console.log("test6: failed deleting all the items from the list");
            }
            else {
                console.log("test6: good");
            }
            cb();
        });
    });
    req9.write(body8);
    req9.end();
});

options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'GET'
});

requests.push(function(cb) {
    options[9].headers = {
        'Cookie': 'sessionId=' + testSessionId
    }
    var req10 = http.request(options[9], function (res) {
        res.on('data', function(data) {
            if (JSON.stringify(JSON.parse(data.toString()).items) !== '{}') {
                console.log("test7: the todo list was supposed to be empty, and wasn't.");
            }
            else {
                console.log("test7: good");
            }
            cb();
        });
    });
    req10.end();
});

options.push({
    host: 'localhost',
    port: '3000',
    path: '/item',
    method: 'GET'
});

requests.push(function(cb) {
    var req11 = http.request(options[10], function (res) {
        if (res.statusCode !== 400) {
            console.log("test8: didn't return error code when no sessionId cookie was sent");
        }
        else {
            console.log("test8: good");
        }
        cb();
    });
    req11.end();
});

function nextTest() {
    if (testsDone < requests.length) {
        var temp = testsDone++;
        requests[testsDone - 1](nextTest);
    }
}
nextTest();

