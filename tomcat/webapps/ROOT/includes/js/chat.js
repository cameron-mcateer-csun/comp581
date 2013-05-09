var client, destination;
function onDocuReady() {
	function makeOnMessage(topic_name) {
		return function(message) {
			$('#messages').append('<div class="chat-message-body"><div class="chat-message-body-header">' + topic_name + "<small>Date HERE</small></div>" + '<div class="chat-message-body-content">' + message.body + "</div></div>");
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

}

$(document).ready(onDocuReady);