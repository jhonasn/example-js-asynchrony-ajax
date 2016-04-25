/// <reference path="lib/jquery.js" />
/// <reference path="lib/materialize.js" />

var ProjetoAula = {
    tarefas: [],
    template: null,
    elementos: {
        novaTarefa: null,
        $listaTarefas: null,
        $titulo: null
    },

    init: function() {
        ProjetoAula.template = jQuery('template.tarefa').html();
        ProjetoAula.elementos.novaTarefa = jQuery('form[name=nova-tarefa]').get(0);
        ProjetoAula.elementos.$listaTarefas = jQuery('section.lista-tarefas ul.tarefas');
        ProjetoAula.elementos.$titulo = jQuery('section.lista-tarefas h4');

        ProjetoAula.listarTarefas();
    },

    listarTarefas: function() {
        ProjetoAula.loading(true);

        jQuery.get('/api/tarefas')
            .success(function(data) {
                ProjetoAula.loading(false);
                ProjetoAula.tarefas = data;
                ProjetoAula.renderizar();
            })
            .error(function(err) {
                ProjetoAula.loading(false);
                var msg = 'erro ' + err.status + ' ao buscar as tarefas do servidor';
                Materialize.toast(msg, 3000, 'rounded');
            });
    },

    buscarTarefaPorId: function(id) {
        var tarefa = ProjetoAula.tarefas.filter(function(tarefa) {
            return tarefa._id == id;
        });

        if (tarefa) {
            return tarefa[0];
        } else {
            return null;
        }
    },

    adicionarTarefa: function() {
        var tarefa = {
            concluida: false,
            titulo: ProjetoAula.elementos.novaTarefa.titulo.value,
            descricao: ProjetoAula.elementos.novaTarefa.descricao.value
        };

        ProjetoAula.salvar(tarefa, function(err, data) {
            if (data) {
                if (!err) {
                    Materialize.toast('Tarefa adicionada!', 3000, 'rounded');
                }
                ProjetoAula.limparNovaTarefa();
                // ProjetoAula.tarefas.push(data);
                // ProjetoAula.renderizar();
                ProjetoAula.listarTarefas();
            }
        });
    },

    alterarTarefa: function() {
        var tarefa = {
            _id: ProjetoAula.elementos.novaTarefa._id.value,
            concluida: ProjetoAula.elementos.novaTarefa.concluida.value,
            titulo: ProjetoAula.elementos.novaTarefa.titulo.value,
            descricao: ProjetoAula.elementos.novaTarefa.descricao.value,
            dataCriacao: ProjetoAula.elementos.novaTarefa.dataCriacao.value
        };

        ProjetoAula.salvar(tarefa, function(err, data) {
            if (data) {
                if (!err) {
                    Materialize.toast('Tarefa alterada!', 3000, 'rounded');
                }
                ProjetoAula.limparNovaTarefa();
                // ProjetoAula.renderizar();
                ProjetoAula.listarTarefas();
            }
        });
    },

    concluirTarefa: function(checkboxTarefa) {
        var id = jQuery(checkboxTarefa).closest('li').attr('itemid');
        var tarefa = ProjetoAula.buscarTarefaPorId(id);

        tarefa.concluida = checkboxTarefa.checked;

        ProjetoAula.salvar(tarefa, function(err, data) {
            // if(!data) {
            //     tarefa.concluida = !tarefa.concluida;
            //     ProjetoAula.renderizar();
            // }
            if (!err) {
                Materialize.toast('Tarefa alterada!', 3000, 'rounded');
            }
            ProjetoAula.listarTarefas();
        });
    },

    salvar: function(tarefa, cb) {
        ProjetoAula.loading(true);

        jQuery.ajax({
                method: 'PUT',
                url: '/api/tarefas',
                data: tarefa
            })
            .success(function(data) {
                ProjetoAula.loading(false);

                if (cb) {
                    cb(null, data);
                }
            })
            .error(function(err) {
                ProjetoAula.loading(false);

                var msg = 'não foi possivel alterar a tarefa ' + tarefa.titulo + '. erro ' + err.status;
                Materialize.toast(msg, 3000, 'rounded');
                cb(err, null);
            });
    },

    remover: function(elementoBotaoRemover) {
        var id = jQuery(elementoBotaoRemover).closest('li').attr('itemid');
        var tarefa = ProjetoAula.buscarTarefaPorId(id);

        if (!tarefa) {
            var msg = 'Tarefa não encontrada na aplicação.';
            Materialize.toast(msg, 3000, 'rounded');
            return;
        }

        ProjetoAula.loading(true);

        jQuery.ajax({
                method: 'DELETE',
                url: '/api/tarefas',
                data: { id: id }
            })
            .success(function(data) {
                ProjetoAula.loading(false);
                if (data) {
                    // var indiceTarefa = ProjetoAula.tarefas.indexOf(tarefa);
                    // ProjetoAula.tarefas.splice(indiceTarefa, 1);

                    // ProjetoAula.renderizar();
                    Materialize.toast('Tarefa removida!', 3000, 'rounded');
                    ProjetoAula.listarTarefas();
                }
            })
            .error(function(err) {
                ProjetoAula.loading(false);
                var msg = 'não foi possivel deletar a tarefa ' + tarefa.titulo + '. erro ' + err.status;
                Materialize.toast(msg, 3000, 'rounded');
            });
    },

    iniciarAlteracaoTarefa: function(elementoTarefa) {
        var id = jQuery(elementoTarefa).closest('li').attr('itemid');
        var tarefa = ProjetoAula.buscarTarefaPorId(id);

        if (!tarefa) {
            var msg = 'Não foi possível encontrar a tarefa selecionada na aplicação.';
            Materialize.toast(msg, 3000, 'rounded');
            return;
        }

        ProjetoAula.elementos.novaTarefa._id.value = tarefa._id;
        ProjetoAula.elementos.novaTarefa.titulo.value = tarefa.titulo;
        ProjetoAula.elementos.novaTarefa.concluida.value = tarefa.concluida;
        ProjetoAula.elementos.novaTarefa.descricao.value = tarefa.descricao;
        ProjetoAula.elementos.novaTarefa.dataCriacao.value = tarefa.dataCriacao;

        ProjetoAula.elementos.$titulo.text('Alterar tarefa: ' + tarefa.titulo);
        jQuery(ProjetoAula.elementos.novaTarefa).find('button.cancelar').show();
        jQuery(ProjetoAula.elementos.novaTarefa).find('button.confirmar').attr('onclick', 'ProjetoAula.alterarTarefa()');
    },

    limparNovaTarefa: function() {
        ProjetoAula.elementos.novaTarefa._id.value = '';
        ProjetoAula.elementos.novaTarefa.titulo.value = '';
        ProjetoAula.elementos.novaTarefa.concluida.value = '';
        ProjetoAula.elementos.novaTarefa.descricao.value = '';
        ProjetoAula.elementos.novaTarefa.dataCriacao.value = '';

        ProjetoAula.elementos.$titulo.text('Nova Tarefa:');
        jQuery(ProjetoAula.elementos.novaTarefa).find('button.cancelar').hide();
        jQuery(ProjetoAula.elementos.novaTarefa).find('button.confirmar').attr('onclick', 'ProjetoAula.adicionarTarefa()');
    },

    renderizar: function() {
        ProjetoAula.elementos.$listaTarefas.empty();

        ProjetoAula.tarefas.forEach(function(tarefa) {
            var $tarefa = jQuery(ProjetoAula.template);

            $tarefa
                .attr('itemid', tarefa._id)
                    .find('.titulo')
                    .text(tarefa.titulo)
                    .closest('li')
                .find('.descricao')
                    .text(tarefa.descricao)
                    .closest('li')
                .find('.concluida')
                    .attr('id', 'ck_' + tarefa._id)
                    .prop('checked', tarefa.concluida)
                    .closest('li')
                .find('label.concluida')
                    .attr('for', 'ck_' + tarefa._id)
                    .closest('li')
                .find('.dataCriacao')
                    .text(
                        ProjetoAula.formatarData(new Date(tarefa.dataCriacao))
                    );


            ProjetoAula.elementos.$listaTarefas.append($tarefa);
        });
    },

    formatarData: function(data) {
        var d = data.getDate();
        var m = data.getMonth() + 1;
        var y = data.getFullYear();
        var h = data.getHours();
        var min = data.getMinutes();
        var mil = data.getMilliseconds();

        return d + '/' + m + '/' + y + ' ' + h + ':' + min + ':' + mil;
    },

    loading: function(loading) {
        var $progress = jQuery('.progress');
        if (loading) {
            $progress.show();
        } else {
            $progress.hide();
        }
    }

};

// jQuery.ready(ProjetoAula.init);
ProjetoAula.init();
