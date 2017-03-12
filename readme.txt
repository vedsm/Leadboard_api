REST API for maintaining a leaderboard

There are 2 dictionaries being maintained
=================================
1. user -> mapping of userId(uid) to rank and score
2. rank -> mapping of rank to uid and score

REST endpoints for following operation
============================================
1. Get users between given higher rank(hr) and lower rank(lr)
url : http://<server>/usersBetweenRanks?hr=<hr>&lr=<lr> (GET method)

2. Update the score of a user
url : http://<server>/updateScore?uid=<uid>&score=<score> (PUT method)

3. Delete a user
url : http://<server>/deleteUser/<uid> (DELETE method)

4. Get a user given a userid
url : http://<server>/user/<uid> (GET method)

5. Add a new user
url  : http://<server>/addUser POST_PARAM:(POST method)

Setting up and running the code and the test cases
==============================================================================
(first cd into the folder)

For installing Dependencies : 
run "npm install"

Running the tests : 
run "npm test"

For running the server :
run "node server.js"
then go to browser or postman or any service which you want to use and use the following APIs
1. GET http://localhost:9000/usersBetweenRanks?hr=<hr>&lr=<lr>
2. PUT http://localhost:9000/updateScore?uid=<uid>&score=<score>
3. DELETE http://localhost:9000/deleteUser/<uid>  with POST_PARAM:{"permissions":["perm5"]}
4. GET http://localhost:9000/user/<uid>
5. POST http://localhost:9000/addUser with POST_PARAM:{uid:<uid>,score:<score>}