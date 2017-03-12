var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');

var should = chai.should();
chai.use(chaiHttp);

var server = require('../server');

var rankFile = "./rank.json";
var userFile = "./user.json";

describe('CheckLeaderboard', () => {
	beforeEach((done) => {
		//we need to set a default value for database before every test case
		var rankData = {1:{"uid":"uid1","score":5},2:{"uid":"uid2","score":4},3:{"uid":"uid3","score":3},4:{"uid":"uid4","score":2}};
		var userData = {"uid1":{"rank":1,"score":5},"uid2":{"rank":2,"score":4},"uid3":{"rank":3,"score":3},"uid4":{"rank":4,"score":2}};

		fs.writeFileSync(rankFile,JSON.stringify(rankData));
		fs.writeFileSync(userFile,JSON.stringify(userData));
		done();
	})

	//get users given a higher rank(hr) and lower rank(lr)
	describe("/GET http://<server>/usersBetweenRanks?hr=<hr>&lr=<lr> Given higher rank and lower rank, it should return users between that rank.", () => {
		it('for /usersBetweenRanks?hr=2&lr=1', (done) => {
			chai.request(server)
				.get('/usersBetweenRanks?hr=2&lr=1')
				.end((err,res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					console.log(res.body)
					done();
				})
		})
	})

	//update the score of a user
	describe("/PUT http://<server>/updateScore?uid=<uid>&score=<score> it should update the score of a user.", () => {
		it('for /updateScore?uid=3&score=1', (done) => {
			chai.request(server)
				.put('/updateScore?uid=uid3&score=1')
				.end((err,res) => {
					res.should.have.status(200);
					console.log(res.body)
					done();
				})
		})
	})

	//DELETE User(uid) -> deletes a user with a uid
	describe("/DELETE http://<server>/deleteUser/<uid> it should delete a user.", () => {
		it('for /deleteUser/uid2', (done) => {
			chai.request(server)
				.delete('/deleteUser/uid2')
				.end((err,res) => {
					res.should.have.status(200);
					console.log(res.body)
					done();
				})
		})
	})

	//GET user(uid) -> given a uid, find the user
	describe("/GET http://<server>/user/<uid> it should fetch a user.", () => {
		it('for /user/uid1', (done) => {
			chai.request(server)
				.get('/user/uid1')
				.end((err,res) => {
					res.should.have.status(200);
					console.log(res.body)
					done();
				})
		})
	})

	//POST user(uid, score) -> add a user
	describe("/POST http://<server>/addUser it should add a user.", () => {
		it('for /addUser with body {uid:"uid10",score:4.5}', (done) => {
			chai.request(server)
				.post('/addUser')
				.send({uid:"uid10",score:4.5})
				.end((err,res) => {
					res.should.have.status(200);
					console.log(res.body)
					done();
				})
		})
	})

})


function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}