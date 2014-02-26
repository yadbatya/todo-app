

module.exports = function() {

    this.dones = 0;
    this.remaining = 0;
    this.items = {};

    this.get = function() {
        return this;
    },

    this.update = function(task) {
        task.status = task.status ? true : false;
        if (task.status !== this.items[task.id].done) {
            if (task.status) {
                this.dones++;
                this.remaining--;
            }
            else {
                this.dones--;
                this.remaining++;
            }
            this.items[task.id].done = task.status;
        }
        if (task.value !== "") {
            this.items[task.id].data = task.value;
        }
        else {
            if (this.items[task.id].done) {
                this.dones--;
            }
            else {
                this.remaining--;
            }
            delete this.items[task.id];
        }
        return {status: 0, msg: ''};
    },

    this.add = function(task) {
        if (!this.items[task.id]) {
            this.items[task.id] = {
                id: task.id,
                data: task.value,
                done: false
            }
            this.remaining++;
            return {status: 0, msg: ''};
        }
        else return 500;
    },

    this.remove = function(todo) {
        if (todo === -1) {
            this.items = {};
            this.dones = 0;
            this.remaining = 0;
        }
        else {
            if (this.items[todo].done) {
                this.dones--;
            }
            else {
                this.remaining--;
            }
            delete this.items[todo];
        }
        return {status: 0, msg: ''};
    }
};