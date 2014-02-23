
var clients = require('./clients');
var miniExpress = require('./miniExpress');
var app = miniExpress();
var port = process.env.PORT || 3000;

app.use("/static", miniExpress.static(__dirname + '/www'));
app.use(miniExpress.bodyParser()).use(miniExpress.cookieParser());

app.put('/item', function(req, res) {
    var user = clients.findBySessionId(req.cookies.sessionId);
    if (user === 'sessionIdError') {
        res.send(400);
    }
    else {
        res.json(user.data.update(req.body));
    }
});

app.get('/item', function(req, res) {
    var user = clients.findBySessionId(req.cookies.sessionId);
    if (user === 'sessionIdError') {
        res.send(400);
    }
    else {
        res.json(user.data.get());
    }
});

app.post('/register', function(req, res) {
    var registerUser = req.body.username;
    var registerFullName = req.body.fullname;
    var registerPass = req.body.password;
    var user = clients.addUser(registerUser, registerPass, registerFullName);
    if (user === 'usernameError') {
        res.send(500);
    }
    else {
        // var sessionId = uuid.v1();
        var sessionId = Math.random();
        user.sessionId = sessionId;
        res.cookie('sessionId', sessionId, { expires: new Date(Date.now() + (30 * 60 * 1000))});
        res.json(sessionId.toString());
    }
});

app.post('/login', function(req, res) {
    var loginUser = req.body.username;
    var loginPass = req.body.password;
    var user = clients.getUser(loginUser, loginPass);
    if (user === 'passwordError' || user === 'noUserError') {
        res.send(500);
    }
    else {
        // var sessionId = uuid.v1();
        var sessionId = Math.random();
        user.sessionId = sessionId;
        res.cookie('sessionId', sessionId, { expires: new Date(Date.now() + (30 * 60 * 1000))});
        res.json(sessionId.toString());
    }
});

app.post('/item', function(req, res){
    var user = clients.findBySessionId(req.cookies.sessionId);
    if (user === 'sessionIdError') {
        res.send(400);
    }
    else {
        var add = user.data.add(req.body);
        if (add === 500) {
            res.send(500);
        }
        else res.send(add);
    }
});

app.delete('/item', function(req, res){
    var temp = JSON.parse(req.body)
    var user = clients.findBySessionId(req.cookies.sessionId);
    if (user === 'sessionIdError') {
        res.send(400);
    }
    else {
        res.json(user.data.remove(temp.id));
    }
});

app.listen(port);
