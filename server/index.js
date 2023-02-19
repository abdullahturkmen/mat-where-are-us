var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
})
var PORT = process.env.PORT || 3001;


var userCoordinates = [];

app.get('/', function (req, res) {
    res.send()
})


io.on("connection", function (socket) { // console.log("gelldddiiii")

    io.emit("allUserCoordinates", userCoordinates)

    socket.on("leftGroup", function () {

        // console.log("e : ", e)

        // console.log("user id : ", userCoordinates.findIndex(e => e.user_id === socket.id))

        var userIndex = userCoordinates.findIndex(e => e.user_id === socket.id)

        if (userIndex >= 0) {
            userCoordinates[userIndex] = {
                ... userCoordinates[userIndex],
                group: undefined
            }
        }
        io.emit("allUserCoordinates", userCoordinates)
    })

    socket.on("joinGroup", function (e) {

        // console.log("e : ", e)

        // console.log("user id : ", userCoordinates.findIndex(e => e.user_id === socket.id))

        var userIndex = userCoordinates.findIndex(e => e.user_id === socket.id)

        if (userIndex >= 0) {
            userCoordinates[userIndex] = {
                ... userCoordinates[userIndex],
                group: e
            }
        }
        io.emit("allUserCoordinates", userCoordinates)
    })


    socket.on("updateCoordinate", function (e) {

        // console.log("e : ", e)

        // console.log("user id : ", userCoordinates.findIndex(e => e.user_id === socket.id))

        var userIndex = userCoordinates.findIndex(e => e.user_id === socket.id)

        if (userIndex < 0) { // console.log("ifin içi")
            userCoordinates.push({
                ... e,
                user_id: socket.id
            })
        } else {

            userCoordinates[userIndex].x = e.x
            userCoordinates[userIndex].y = e.y
        } io.emit("allUserCoordinates", userCoordinates)
    })


    socket.on("disconnect", () => {

        var userIndex = userCoordinates.findIndex(e => e.user_id === socket.id)
        userCoordinates.splice(userIndex, 1)

    });

})


http.listen(PORT, function () {
    console.log("server is runnnngggg : ", PORT)
})
