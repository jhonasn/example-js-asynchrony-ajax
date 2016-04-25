var express = require('express');
var router = express.Router();
var tarefasRepository = require('../repository/tarefas');

router.get('/tarefas', function(req, res, next) {
    if (req.body.id) {
        tarefasRepository.findById(req.body.id, function(err, tarefa) {
            if (err) next(err);
            res.send(tarefa);
        });
    } else {
        tarefasRepository.list(function(err, tarefas) {
            if (err) next(err);
            res.send(tarefas);
        });
    }
});

router.put('/tarefas', function(req, res, next) {
    tarefasRepository.save(req.body, function(err, tarefa) {
        if (err) next(err);
        res.send(tarefa);
    });
});

router.delete('/tarefas', function(req, res, next) {
    tarefasRepository.remove(req.body.id, function(err, tarefa) {
        if (err) next(err);
        res.send(tarefa);
    });
});

module.exports = router;
