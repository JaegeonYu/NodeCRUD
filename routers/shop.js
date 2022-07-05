var router = require('express').Router();

router.get('/shop/shirts', function(req, res){
    res.send("sell shirts");
});

router.get('/shop/pants', function(req, res){
    res.send("sell pants");
});

module.exports = router;