var router = require('express').Router();

router.get('/sports', function(req, res){
    res.send("sub sports");
});

router.get('/game', function(req, res){
    res.send("sub game");
});

module.exports = router;