/// <reference path="lib/jquery.js" />
/// <reference path="lib/materialize.js" />

var ProjetoAula = {
	elementos: {
		novaTarefa: null,
		$listaTarefas: null,
		$titulo: null
	},

	init: function() {
		ProjetoAula.elementos.novaTarefa = jQuery('form[name=nova-tarefa]').get(0);
		ProjetoAula.elementos.$listaTarefas = jQuery('section.lista-tarefas ul.tarefas');
		ProjetoAula.elementos.$titulo = jQuery('section.lista-tarefas h4');
	},

	listarTarefas: function() {
		ProjetoAula.loading(true);

		jQuery.get('/engine/tarefas')
			.success(function(data) {
				ProjetoAula.loading(false);
				ProjetoAula.elementos.$listaTarefas.html(data);
			})
			.error(function(err) {
				ProjetoAula.loading(false);
				var msg = 'erro ' + err.status + ' ao buscar as tarefas do servidor';
				Materialize.toast(msg, 3000, 'rounded');
			});
	},

	buscarTarefaPorId: function (id) {
		var $tarefa = ProjetoAula.elementos.$listaTarefas.find('li[itemid="' + id + '"]');

		if($tarefa.length) {
			var tarefa = {
				_id: id,
				concluida: $tarefa.find('input[type=checkbox].concluida').value,
				titulo: $tarefa.find('.titulo').text(),
				descricao: $tarefa.find('.descricao').text(),
				dataCriacao: ProjetoAula.converterData($tarefa.find('.dataCriacao').text())
			};

			return tarefa;
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

		ProjetoAula.salvar(tarefa, function (err, data) {
			if(data) {
				ProjetoAula.limparNovaTarefa();
				ProjetoAula.listarTarefas();
			}
		});
	},

	alterarTarefa: function () {
		var tarefa = {
			_id: ProjetoAula.elementos.novaTarefa._id.value,
			concluida: ProjetoAula.elementos.novaTarefa.concluida.value,
			titulo: ProjetoAula.elementos.novaTarefa.titulo.value,
			descricao: ProjetoAula.elementos.novaTarefa.descricao.value,
			dataCriacao: ProjetoAula.elementos.novaTarefa.dataCriacao.value
		};

		ProjetoAula.salvar(tarefa, function (err, data) {
			if(data) {
				ProjetoAula.limparNovaTarefa();
				ProjetoAula.listarTarefas();
			}
		});
	},

	concluirTarefa: function (checkboxTarefa) {
		var id = jQuery(checkboxTarefa).closest('li').attr('itemid');
		var tarefa = ProjetoAula.buscarTarefaPorId(id);

		tarefa.concluida = checkboxTarefa.checked;

		ProjetoAula.salvar(tarefa, function (err, data) {
			ProjetoAula.listarTarefas();
		});
	},

	salvar: function(tarefa, cb) {
		ProjetoAula.loading(true);

		jQuery.ajax({
			method: 'PUT',
			url: '/engine/tarefas',
			data: tarefa
		})
			.success(function(data) {
				ProjetoAula.loading(false);

				if(data) {
					Materialize.toast('Tarefa salva!', 3000, 'rounded');
				}

				if(cb) {
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

		if(!tarefa) {
			var msg = 'Tarefa não encontrada na aplicação.';
			Materialize.toast(msg, 3000, 'rounded');
			return;
		}

		ProjetoAula.loading(true);

		jQuery.ajax({
			method: 'DELETE',
			url: '/engine/tarefas',
			data: { id: id }
		})
			.success(function(data) {
				ProjetoAula.loading(false);
				if(data) {
					Materialize.toast('Tarefa excluida!', 3000, 'rounded');
					ProjetoAula.listarTarefas();
				}
			})
			.error(function(err) {
				ProjetoAula.loading(false);
				var msg = 'não foi possivel deletar a tarefa ' + tarefa.titulo + '. erro ' + err.status;
				Materialize.toast(msg, 3000, 'rounded');
			});
	},

	iniciarAlteracaoTarefa: function (elementoTarefa) {
		var id = jQuery(elementoTarefa).closest('li').attr('itemid');
		var tarefa = ProjetoAula.buscarTarefaPorId(id);

		if(!tarefa) {
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

	converterData: function (data) {
		data = data.trim();
		var datahora = data.split(' ');
		data = datahora[0].split('/');
		hora = datahora[1].split(':');

		data = new Date(
			Number(data[2]),
			Number(data[1]),
			Number(data[0]),
			Number(hora[0]),
			Number(hora[1]),
			Number(hora[2])
		);

		return data.toJSON();
	},

	loading: function (loading) {
		var $progress = jQuery('.progress');
		if(loading) {
			$progress.show();
		} else {
			$progress.hide();
		}
	}

};

// jQuery.ready(ProjetoAula.init);
ProjetoAula.init();
