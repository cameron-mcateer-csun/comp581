/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the 'License'); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var client, destination;
function onDocuReady() {
	$('#connect_form').submit(function() {
		var url = "ws://" + window.location.host + ":61616";
		var login = $("#connect_login").val();
		var passcode = $("#connect_passcode").val();
		destination = login;

		client = Stomp.client(url);

		// this allows to display debug logs directly on the web page
		client.debug = function(str) {
			$("#debug").append(str + "\n");
		};

		// the client is notified when it is connected to the server.
		var onconnect = function(frame) {
			client.debug("connected to Stomp");
			$('#connect').fadeOut({
				duration: 'fast'
			});
			$('#disconnect').fadeIn();
			$('#send_form_input').removeAttr('disabled');

			client.subscribe(destination, function(message) {
				$("#messages").append("<p>" + message.body + "</p>\n");
			});
		};

		client.connect(login, passcode, onconnect);

		return false;
	});

	$('#disconnect_form').submit(function() {
		client.disconnect(function() {
			$('#disconnect').fadeOut({
				duration: 'fast'
			});
			$('#connect').fadeIn();
			$('#send_form_input').addAttr('disabled');
		});
		return false;
	});

	$('#send_form').submit(function() {
		var text = $('#send_form_input').val();
		if (text) {
			client.send(destination, {}, text);
			$('#send_form_input').val("");
		}
		return false;
	});

}

(function() {
	this.Chat = {
		client: {},

		connect: function(login, passcode, callback, errorcallback) {
			if (this.client.connected)
				return;

			var url = "ws://" + window.location.host + ":61616";

			this.client = Stomp.client(url);

			// this allows to display debug logs directly on the web page
			this.client.debug = function(str) {
				$("#debug").append(str + "\n");
			};

			// the client is notified when it is connected to the server.
			var onconnect = function(frame) {
				this.client.debug("connected to Stomp");

				if (callback instanceof Function)
					callback();
			};

			this.client.connect(login, passcode, onconnect, errorcallback);

			return false;
		} // connect,

		disconnect: function(callback) {
			if (!this.client.connected)
				return;
			$(this.client.subscriptions).each(function(id, subscription) {
				this.client.unsubscribe(id);
			})
			this.client.disconnect(callback);
			return false;
		},

		send: function(text) {
			if (!this.client.connected)
				return;
			if (text) {
				this.client.send(destination, {}, text);
			}
			return false;
		},

		subscribe: function(destination, callback) {
			if (!this.client.connected)
				return;

			var _callback = function(msg) {
				callback(destination.replace(/^\/topic\//i, ""), msg);
			}

			this.client.subscribe("/topic/"+destination, _callback);
		},

		unsubscribe: function(id) {
			this.client.unsubscribe(id);
		}
	}
}).call(this)