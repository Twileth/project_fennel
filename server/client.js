module.exports = (function (){
	// Not a shared object!
	var client = {
		credential: undefined,
		key_state: undefined,
		setup: function (socket, connection_data){
			this.key_state = Object.create(require('./key_state.js'));
			this.socket = socket;
			this.credential = connection_data.insecure_email;
			var new_client = this;
			socket.on('client_message', function (control_message) {
				new_client.recieve_message(control_message);
			});
		},
		set_credential: function (new_credential){
			this.credential = new_credential;
		},
		resolve_credential: function (){
			if(!this.credential){
				return 'Guest';
			}
			return this.credential;
		},
		take_turn: function (){
			var command_flags = this.key_state.command_keys();
			this.key_state.clear_press();
			return command_flags;
		},
		recieve_message: function (data){
			for(var data_key in data){
				switch(data_key){
				case 'key_down':
					this.key_state.key_down(data[data_key]);
				break;
				case 'key_up':
					this.key_state.key_up(data[data_key]);
				break;
				case 'chat':
					for(var client_index = 0; client_index <= this.game.players.length; client_index++){
						var indexed_player = this.game.players[client_index];
						if(!indexed_player){ continue}
						var indexed_client = indexed_player.intelligence;
						if(!indexed_client){ continue}
						var chat_message = {
							user: this.resolve_credential(this.credential),
							body: data[data_key]
						}
						indexed_client.send_message({
							chat: [chat_message]
						})
					}
				break;
				}
			}
		},
		send_message: function (data){
			this.socket.emit('update', data)
			//client.networking.recieve_message(data);
		}
	}
	return client;
})();