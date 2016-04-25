var mongoose = require('mongoose');

var Tarefa = mongoose.model('tarefas', {
    concluida: { type: Boolean, required: true },
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    dataCriacao: { type: Date, required: true }
});

var objectIdIsValid = mongoose.Types.ObjectId.isValid;

module.exports = {
    findById: function(id, cb) {
        if (objectIdIsValid(id)) {
            Tarefa.findById(id, function(err, tarefa) {
                cb(err, tarefa);
            });
        } else {
            cb({ status: 404, message: 'Tarefa não encontrada' });
        }
    },
    list: function(cb) {
        Tarefa.find({}, function(err, tarefas) {
            cb(err, tarefas);
        });
    },
    save: function(tarefa, cb) {
        if (!tarefa) cb({ status: 204, message: 'Tarefa não informada' });
        if (tarefa._id) {
            var id = tarefa._id;
            delete tarefa._id;

            Tarefa.update({ _id: id }, tarefa, function(err, affected) {
                cb(err, !!affected.ok);
            });
        } else {
            tarefa.dataCriacao = new Date();

            tarefa = new Tarefa(tarefa);
            tarefa.save(function(err, tarefa, affected) {
                cb(err, tarefa);
            });
        }
    },
    remove: function(id, cb) {
        if (objectIdIsValid(id)) {
            Tarefa.remove({ _id: id }, function(err, tarefa) {
                cb(err, !!tarefa.result.ok);
            });
        } else {
            cb({ status: 404, message: 'registro não encontrado.' });
        }
    }
};
