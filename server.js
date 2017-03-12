var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 9000;


var rankFile = "./rank.json";
var userFile = "./user.json";

var rankData  = JSON.parse(fs.readFileSync(rankFile).toString());
var userData = JSON.parse(fs.readFileSync(userFile).toString())

//GET users(hr,lr) -> get users given a higher rank and lower rank
app.get('/usersBetweenRanks', (req,res) => {
	var higherRank = req.query.hr;
	var lowerRank = req.query.lr;

	if(!higherRank && !lowerRank)
		return res.status(400).send("higherRank and lowerRank not provided");
	if(!higherRank || !lowerRank){
		higherRank = higherRank | lowerRank;
		lowerRank  = higherRank | lowerRank;
	}

	var resultUsers = [];
	for(var i=lowerRank; i<=higherRank; i++){
		var user = rankData[i];
		if(user){
			resultUsers.push({
				rank : i,
				uid  : user.uid,
				score: user.score
			})
		}
	}
	res.json({users:resultUsers});
})

//PUT Score(uid,score) -> update the score of a user
app.put('/updateScore', (req,res) => {
	var uid = req.query.uid;
	var score = Number(req.query.score);

	if(!uid || !score)
		return res.status(400).send("uid or score not provided");

	console.log("before update->",rankData,userData);

	var currUser = userData[uid];
	if(!currUser)
		return res.status(400).send("the user with uid:"+uid+" does not exists in database");

	var prevScore = currUser.score;
	var currRank = currUser.rank;
	rankData[currRank].score=score;
	userData[uid].score=score;
	if(prevScore<score){
		//move left
		var nextUser = rankData[currRank-1];
		while(nextUser){
			// console.log("currRank->",currRank,rankData,userData)
			if(nextUser.score>score)
				break;
			else{
				rankData[currRank] = nextUser;
				userData[nextUser.uid].rank=currRank;
				rankData[currRank-1] = {uid:uid,score:score};
				userData[uid].rank=currRank-1;
				currRank=currRank-1;
				nextUser = rankData[currRank-1];
			}
		}
	}
	else{
		//move right
		var nextUser = rankData[currRank+1];
		while(nextUser){
			// console.log("currRank->",currRank,rankData,userData)
			if(nextUser.score<score)
				break;
			else{
				rankData[currRank] = nextUser;
				userData[nextUser.uid].rank=currRank;
				rankData[currRank+1] = {uid:uid,score:score};
				userData[uid].rank=currRank+1;
				currRank=currRank+1;
				nextUser = rankData[currRank+1];
			}
		}
	}

	console.log("after update->",rankData,userData);
	fs.writeFileSync(rankFile,JSON.stringify(rankData));
	fs.writeFileSync(userFile,JSON.stringify(userData));
	res.status(200).send({rank:currRank});
})

//DELETE User(uid) -> deletes a user with a uid
app.delete('/deleteUser/:uid', (req,res) => {
	var uid = req.params.uid;

	if(!uid)
		return res.status(400).send("uid not provided");

	var currUser = userData[uid];
	if(!currUser)
		return res.status(400).send("user with uid: "+uid+" not found");
	else{
		var currUserRank = currUser.rank;
		delete rankData[currUserRank]; 
		delete userData[uid]; 
		var tempRank = currUser.rank+1;
		var tempUser = rankData[tempRank];
		while(tempUser){
			rankData[tempRank-1] = tempUser;
			delete rankData[tempRank];
			userData[tempUser.uid].rank = tempRank-1;
			tempRank = tempRank+1;
			tempUser = rankData[tempRank];
		}

		console.log("after modification",rankData,userData);
			fs.writeFileSync(rankFile,JSON.stringify(rankData));
		fs.writeFileSync(userFile,JSON.stringify(userData));
		res.status(200).send(true);
	}

})
//GET user(uid) -> given a uid, find the user
app.get('/user/:uid', (req,res) => {
	var uid = req.params.uid;

	if(!uid)
		return res.status(400).send("no uid provided");

	var user = userData[uid];
	if(!user)
		return res.status(400).send("user with uid: "+uid+" not found");
	else
		return res.status(200).send({
			rank:user.rank,
			uid:uid,
			score:user.score
		})

	res.status(200).send({user:"user"});
})
//TODO:POST user(uid, score) -> add a user
app.post('/addUser', (req,res) => {
	var uid = req.body.uid;
	var score = req.body.score;

	if(!uid || !score)
		return res.status(400).send("no uid or score provided");

	console.log("before addition",rankData,userData)

	var currRank = 1;
	var currUser = rankData[currRank];
	var addedSuccessfully = false;
	while(currUser){
		if(score > currUser.score){
			//found the position, increment ranks of next all positions
			var tempUser = {uid:currUser.uid,score:currUser.score}
			var tempRank = currRank+1;
			rankData[currRank] = {uid : uid,score : score}
			userData[uid] = {rank : currRank,score:score}
			while(tempUser){
				// console.log("tempUser",tempUser,"tempRank",tempRank)
				var tempUser2 = {uid:tempUser.uid,score:tempUser.score};//check if reference by data or pointer
				tempUser = rankData[tempRank];
				rankData[tempRank] = tempUser2;
				userData[tempUser2.uid].rank = tempRank;
				tempRank=tempRank+1;
			}
			addedSuccessfully = true;
			break;
		}
		else{
			currRank++;
			currUser = rankData[currRank];
		}
	}

	if(!addedSuccessfully){
		rankData[currRank]={uid : uid,score : score};
		userData[uid]={rank:currRank,score:score};
	}

	console.log("after addition",rankData,userData)
	fs.writeFileSync(rankFile,JSON.stringify(rankData));
	fs.writeFileSync(userFile,JSON.stringify(userData));
	res.status(200).send({rank:currRank})
})

app.listen(port);
console.log("the app is running just fine");

module.exports = app;