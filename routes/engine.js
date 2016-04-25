var express = require('express');
var router = express.Router();
var tarefasRepository = require('../repository/tarefas');

module.helpers = {
    formatarData: function(data) {
        var d = data.getDate();
        var m = data.getMonth() + 1;
        var y = data.getFullYear();
        var h = data.getHours();
        var min = data.getMinutes();
        var mil = data.getMilliseconds();

        return d + '/' + m + '/' + y + ' ' + h + ':' + min + ':' + mil;
    }
};

router.get('/', function(req, res, next) {
    tarefasRepository.list(function(err, tarefas) {
		if(err) next(err);
        res.render('home', {
            tarefas: tarefas,
            helpers: module.helpers
        });
    });
});

router.get('/tarefas', function(req, res, next) {
    tarefasRepository.list(function(err, tarefas) {
		if(err) next(err);
        res.render('partials/tarefas', {
            tarefas: tarefas,
            layout: false,
            helpers: module.helpers
        });
    });
});

router.put('/tarefas', function(req, res, next) {
    tarefasRepository.save(req.body, function(err, tarefa) {
		if(err) next(err);
        res.send(tarefa);
    });
});

router.delete('/tarefas', function (req, res, next) {
	tarefasRepository.remove(req.body.id, function (err, tarefa) {
		if(err) next(err);
		res.send(tarefa);
	});
});

module.exports = router;
