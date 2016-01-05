var express = require('express')
  , http = require('http')
  , app = express()

var server = http.createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');

var port = process.env.PORT || 8786;

server.listen(port, function() {
  console.log(' - listening on ' + port);
});

// server.listen(8786);

// usernames which are currently connected to the chat
var usernames = {};


function check_key(v)
{
	var val = false;
	
	for(var key in usernames)
	{
		if(key == v)
			val = true;
		// console.log(key);
	}
	return val;
}

io.sockets.on('connection', function ( socket ) {
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function ( username ){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = socket.id;
		console.log('Connected : '+socket.username);
		console.log(usernames);
		var msg = 'You are conneted.'
		io.to(usernames[username]).emit('notify', msg, 'success');
		// // echo to client they've connected
		// socket.emit('updatechat', 'SERVER', 'you have connected');
		// // echo to client their username
		// socket.emit('store_username', username);
		// // echo globally (all clients) that a person has connected
		// socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected: ' + socket.id);
		// // update the list of users in chat, client-side
		// io.sockets.emit('updateusers', usernames);
	});
	// when the user sends a private msg to a user id, first find the username
	socket.on('check_user', function (asker, id){
		// console.log("SEE: "+asker); console.log("Id: "+check_key(id));
		io.to(usernames[asker]).emit('users_found', check_key(id), id);
	});
	// tell the user i am online
	socket.on('tell_user', function (teller, id){
		// console.log("SEE: "+asker); console.log("Id: "+check_key(id));
		io.to(usernames[id]).emit('user_told', true, teller);
	});
	// when the user disconnects.. perform this
	socket.on('disconnect', function (){
		// remove the username from global usernames list
		console.log('Disconnected : '+socket.username);
		io.sockets.emit('user_told', false, socket.username);

		delete usernames[socket.username];
		console.log(usernames);
		// update list of users in chat, client-side
		// io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		// socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
	socket.on('msg_user', function (usr, username, msg) {
		console.log("From user: "+username);
		console.log("To user: "+usr);
		console.log(msg);

		io.to(usernames[usr]).emit('msg_user_handle', username, msg, check_key(usr));
		io.to(usernames[username]).emit('msg_user_handle', username, msg, check_key(usr));

		// io.sockets.socket(usernames[username]).emit('msg_user_handle', username, msg);

		// fs.writeFile("chat_data.txt", msg, function(err) {
		// 	if(err) {
		// 	console.log(err);
		// 	} /*else {
		// 	console.log("The file was saved!");
		// 	}*/
		// 	});
	});
});
