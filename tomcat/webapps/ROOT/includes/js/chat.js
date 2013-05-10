var client, destination;
function onDocuReady() {
	function makeOnMessage(topic_name) {
		return function(message) {
			var date = new Date(Number(message.headers.timestamp));
			var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			var mo = months[date.getMonth()];
			var d = date.getDate();
			var h = date.getHours();
			var a = h >= 13 ? "PM" : "AM";
			h = h >= 13 ? h-12 : h;
			var m = date.getMinutes();
			var str = mo + " " + d + ", " + h + ":" + m + " " + a;
			$('#messages').prepend('<div class="chat-message-body"><div class="chat-message-body-header">' + topic_name + "<small>"+str+"</small></div>" + '<div class="chat-message-body-content">' + message.body + "</div></div>");
			$("#chat_message_list").scrollTop(0);
		}
	}
	function makeOnSelfMessage(self_name) {
		return function(message) {
			var date = new Date(Number(message.headers.timestamp));
				var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
				var mo = months[date.getMonth()];
				var d = date.getDate();
				var h = date.getHours();
				var a = h >= 13 ? "PM" : "AM";
				h = h >= 13 ? h-12 : h;
				var m = date.getMinutes();
				var str = mo + " " + d + ", " + h + ":" + m + " " + a;
				$('#messages').prepend('<div class="chat-message-body"><div class="chat-message-body-header"><span style="color:red;">' + self_name + "</span><small>"+str+"</small></div>" + '<div class="chat-message-body-content">' + message.body + "</div></div>");
				$("#chat_message_list").scrollTop(0);
			}
	}

	function validTopicName(topic_name) {
		return /^[a-zA-z0-9_]+$/.test(topic_name);
	}

	$('#connect_form').submit(function() {
		// check here for local testing
		var host = /file/i.test(window.location.protocol) ? "ec2-75-101-218-0.compute-1.amazonaws.com" : window.location.host;
		var url = "ws://" + host + ":61616";
		var login = $("#connect_login").val();
		if (!validTopicName(login)) {
			alert("Cannot login with this name");
			return false;
		}
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
			$('#subscribe').fadeIn();
			$('#send_form_input').removeAttr('disabled');

			client.subscribe("/topic/"+login, makeOnSelfMessage(login));

			$("#send_form_input").focus();

			$(document.body).scrollTop(0);
		};

		client.connect(login, passcode, onconnect);

		return false;
	});

	$('#subscribe_form').submit(function() {
		var uname = $('#subscribe_input').val();

		if (!validTopicName(uname)) {
			alert("Cannot subcsribe to this topic");
			return false;
		}

		client.subscribe("/topic/"+uname, makeOnMessage(uname));

		$('#subscribe_input').val("");

		return false;
	});

	$('#disconnect_form').submit(function() {
		for (var id in client.subscriptions) {
			client.unsubscribe(id);
		}
		client.disconnect(function() {
			$('#disconnect').fadeOut({
				duration: 'fast'
			});
			$('#subscribe').fadeOut({
				duration: 'fast'
			});
			$('#connect').fadeIn();
			$('#send_form_input').attr('disabled', 'true');
			$('#messages').html("");
			$('#debug').html("");
			$("#connect_login").focus();
		});
		return false;
	});

	$('#send_form').submit(function() {
		var text = $('#send_form_input').val();
		if (text) {
			client.send("/topic/"+destination, {}, text);
			$('#send_form_input').val("");
		}
		return false;
	});

	$("#connect_login").focus();

}

$(document).ready(onDocuReady);