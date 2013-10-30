exports.index = function(req, res) {
    res.render('index/index', {
        title: 'Homepage'
    });
};