var express = require('express');
var router = express.Router();
var Flickr = require("node-flickr");
var config = require('../config');
var mLab = 'mongodb://' + config.db.host + '/' + config.db.name;
var keys = {"api_key": config.api.key}
    flickr = new Flickr(keys);
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var History = require('../models/history');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'API Image Search Abstraction Layer'
    });
});

//url : https://farm{farm_id}.staticflickr.com/{server_id}/{photo_id}_{secret}.jpg
//snippet : photo title
//context : https://www.flickr.com/photos/{owner_id}/{photo_id}
var photoObj = [];
var page = 1;
router.get('/search/:q', function (req, res) {
    mongoose.connect(mLab);
    new History({term: req.params.q}).save(function(err) {
        if (err) throw err;
        //console.log("history was saved");
    });
    mongoose.disconnect();
    page = req.query.offset;
    flickr.get("photos.search", {"text": req.params.q, "sort" : "relevance", "page" : page, "per_page": 10}, function(err, photos){
    if (err) return console.error(err);
    var photoNum = photos.photos.photo.length;
        
        for (var i = 0; i < photoNum; i++) {
            photoObj[i] = {
                title: photos.photos.photo[i].title,
                url: 'https://farm' + photos.photos.photo[i].farm + '.staticflickr.com/' + photos.photos.photo[i].server + 
                '/' + photos.photos.photo[i].id + '_' + photos.photos.photo[i].secret + '.jpg',
                context: 'https://www.flickr.com/photos/' + photos.photos.photo[i].owner + '/' + photos.photos.photo[i].id
            }
        }
        
        res.send(photoObj);
});    
});
router.get('/latest', function(req, res) {
    mongoose.connect(mLab);
    History.find({}, 'term when -_id').limit(10).sort({'when': -1}).exec(function(err, history) {
       if (err) throw err;
        res.send(history);
    });
    mongoose.disconnect();
    
});
module.exports = router;