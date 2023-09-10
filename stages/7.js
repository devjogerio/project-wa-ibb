var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}

const pms = require('../interface/permission.json')
const db = require('../interface/db_Sheets')
const fnc = require('../helpers/helpers')
const gestor = require('../models/_gestor')
const dados = require('../models/_dados')
const moment = __importDefault(require('moment'))

function execute(user, msg) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 7')

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*') {
		return fnc.fncgetFinish(user)
	}

	let _msgRetorno = []
	if (msg.toLowerCase() == 'voltar') {
		dados[user].stage = 6
		return [gestor[pms.p]._menu_opcao.menu[3]]
	}

	if (msg == '#') {
		;(async () => {
			let _tbPedido = 'Pedidos'

			let vNow = moment.default(new Date())
			let _dtPedido = vNow.format('DD/MM/YY HH:mm:ss')
			let _pedido = dados[user]._phone_num + '-' + dados[user]._pedido._numero

			let _total = 0
			let _qtdeItem = 0
			dados[user]._pedido._itens.forEach((value) => {
				_total += value[5]
				_qtdeItem++
			})

			let _editPedido = {
				Status: 'Sim',
				Data_fechado: _dtPedido,
				Atendimento: 'Liberado',
				NomeCliente: dados[user]._phone_name,
				Num_Item: _qtdeItem,
				Total: _total,
				Entrega: dados[user]._pedido._delivery,
				Lat: dados[user]._pedido._lat,
				Lng: dados[user]._pedido._lng,
				Endereco: dados[user]._pedido._address,
				Referencia: dados[user]._pedido._reference,
				Pgto: dados[user]._pedido._payment,
			}

			let _finalizar = await db.fncEditDados(
				_tbPedido,
				'Key',
				_pedido,
				_editPedido
			)
		})()

		let _textFechamento =
			`💬 ` +
			`Seu Pedido foi realizado com Sucesso!. _Estamos encaminhando o seu pedido de Nº ` +
			dados[user]._pedido._numero +
			` para um de nossos atendentes!_' + '\n` +
			`💬 ` +
			'*Obrigado pela Preferência!!* 🤗'

		dados[user]._pedido_enviar = true
		dados[user].stage = 0
		return [
			_textFechamento,
			`💬 ` + 'Caso você queira voltar ao menu principal, digite *Voltar*.',
		]
	}

	dados[user].stage = 0
	return [`💬 ` + ' Digite uma opção válida!']
}

exports.execute = execute
