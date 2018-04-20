const express = require('express');

const app = express();
app.use(express.static(__dirname + '/AngularApp/dist'));

// Require path
const path = require('path');
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.json());

// Require Mongoose
var mongoose = require('mongoose');
// connect to mongodb using mongoose 
mongoose.connect('mongodb://localhost/teamManager');

// create schema
var Schema = mongoose.Schema;

var PlayerSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    position: {type: String, required: true, minlenght: 3},
    games: [{type: Schema.Types.ObjectId, ref: 'Game'}],
}, {timestamps: true})
mongoose.model("Player",PlayerSchema);
var Player = mongoose.model("Player");

var GameSchema = new mongoose.Schema({
    _player: {type: Schema.Types.ObjectId, ref: 'Player'},
    status: {type: String, required: true, minlength: 2}
}, {timestamps: true})
mongoose.model('Game',GameSchema);
var Game = mongoose.model('Game');

app.get('/', function (req, res){
    console.log('got hit');
    res.render('index');
});

app.get('/players/', function(req,res){
    Player.find({}, function(err, players) {
        if (err){
            console.log("error retrieving players");
            res.json({message: "Error", error: err})
        } else {
            res.json({message: "Success", data: players})
        }
    })
})

app.get('/player/:id', function(req, res){
    Player.find({_id: req.params.id})
    .populate('games')
    .exec(function (err, player){
        if (err){
            console.log("error retrieving player");
            res.json({message: "Error", error: err})
        } else {
            res.json({message: "Success", data: player})
        }
    })
})

app.get('/game/:id', function(req, res){
    Game.find({_id: req.params.id}, function(err, game){
        if (err) {
            console.log("error retrieving game");
            res.json({message: "Error", error: err})
        } else {
            res.json({message: "Success", data: game})
        }
    })
})

app.delete('/player/:id', function(req,res){
    Player.findByIdAndRemove(req.params.id, function(err, player) {
        if (err){
            console.log("error deleting player");
            res.json({message: "Error", error: err})
        } else {
            console.log("in server, player: ", player)
            res.json({message: "Success", data: player})
        }        
    })
})

app.post('/player/', function(req,res){
    var player = new Player({"name": req.body.name,"position": req.body.position});
    player.save(function(err){
        if (err){
            console.log("error creating the player");
            res.json({message: "Error", error: err})
        } else {
            res.json({message: "Success", data: player})
        }        
    })
})

app.post('/creategame/', function(req, res){
    var game = new Game({"status": req.body.game.status});
    var playerId = req.body.playerId;
    Player.findOne({_id: playerId}, function(err, player){
        game._player = player._id;
        game.save(function(err){
            player.games.push(game);
            player.save(function(err){
                if (err){
                    console.log("error saving player with game");
                    res.json({message: "Error", error: err});
                } else {
                    console.log("$$$ saved player: ", player);
                    res.json({message: "Success", player: player, game: game});
                }
            })
        })
    })
})

app.put('/player/:id', function(req,res){
    console.log("in update route")
    Player.update({_id: req.params.id}, {name: req.body.name, position: req.body.position},{runValidators: true}, function (err){
        if (err){
            res.json({message: "Error", error: err})
        } else {
            res.json({message: "Success - Player Updated"})
        }
    });    
})

app.put('/game/:id', function(req,res){
    console.log("in game update route")
    Game.update({_id: req.params.id}, {status: req.body.status},{runValidators: true}, function (err){
        if (err){
            res.json({message: "Error", error: err})
        } else {
            res.json({message: "Success - Game Updated"})
        }
    });    
})

app.delete('/game/:id', function(req,res){
    console.log("in delete id: ", req.params.id);
    Game.findByIdAndRemove(req.params.id, function(err, game) {
        if (err){
            console.log("error deleting game");
            res.json({message: "Error", error: err})
        } else {
            console.log("in server, game: ", game)
            res.json({message: "Success", data: game})
        }        
    })
})

app.all("*", (req,res,next) => {
  res.sendFile(path.resolve("./AngularApp/dist/index.html"))
});

app.listen(8000, function() {
    console.log("Hello Angular listening on port 8000")
})
