var Data = require('./data')

var clients = {};



function Client(username, password, fullname) {
    if (!clients[username]) {
        this.password = password;
        this.fullname = fullname;
        this.data = new Data();
        clients[username] = this;
    }
    else {
        return "usernameError";
    }
}

module.exports = {

    addUser: function(username, password, fullname) {
        var client = new Client(username, password, fullname);
        if (!client.password) {
            return "usernameError";
        }
        return client;
    },

    getUser: function(username, password) {
        if (clients[username]){
            if (clients[username].password === password) {
                return clients[username];
            }
            else {
                return "passwordError";
            }
        }
        else {
            return "noUserError";
        }
    },

    findBySessionId: function(sessionId) {
        for (i in clients) {
            if (clients[i].sessionId) {
                if(clients[i].sessionId == sessionId) {
                    return clients[i];
                }
            }
        }
        return "sessionIdError";
    }

}
