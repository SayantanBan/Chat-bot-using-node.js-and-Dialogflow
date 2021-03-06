'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request')

const API_AI_TOKEN = "5c67375e66964f288f49b547cad094e5";
const token="EAADzk2PV5LsBAFpjRMDlonsp8mB1m1HMtJG3LpZAEtF0kf6PU97rRVz1evxrdR9Agso7NpHVRAdukqyvE4ZBKpb1zkjGVGtPelXl7Act12WqnKX14dSU8NZCgDV4w6q2Y3AZCRDHWO1GiZAZBATC1ja88RwDZAsY8ZANpiYEp219kPKKv4GxWDNW"
const apiAiClient = require('apiai')(API_AI_TOKEN);

const app = express();
app.set('port',(process.env.PORT || 5000))

//Allows us to process the data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//ROUTES
app.get('/',function(req,res){
    res.send("Hi, I am chatbot")
})

//Facebook
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === "blondiebytes") {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
})

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			
			const apiaiSession = apiAiClient.textRequest(text, {sessionId: 'chatbot'});
			apiaiSession.on('response', (response) => {
			 const result = response.result.fulfillment.speech;
			sendText(sender, result);
			 });
			apiaiSession.on('error', error => console.log(error));
			apiaiSession.end();		}
	}
	res.sendStatus(200)
})

function sendText(sender, text) {
	let messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

/*const sendTextMessage = (senderId, text) => {
	request({
	url: 'https://graph.facebook.com/v2.6/me/messages',
	qs: { access_token: FACEBOOK_ACCESS_TOKEN },
	method: 'POST',
	json: {
	recipient: { id: senderId },
	message: { text },
	}
	});
   };
*/

app.listen(app.get('port'), function(){
    console.log("running:port")
})