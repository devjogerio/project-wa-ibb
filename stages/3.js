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

// Forma de Entrega
function execute(user, msg) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 3')

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*') {
		return fnc.fncgetFinish(user)
	}

	let _msgRetorno = []
	if (msg.toLowerCase() == 'voltar') {
		dados[user].stage = 1
		return [gestor[pms.p]._menu_opcao.menu[0]]
	}

	//Opção ok - Continua o preenchimento dos itens no pedido
	// stage <- 2
	if (msg.toLowerCase() == 'ok') {
		let footer =
			`💬 ` + 'Informe o *código* do produto para continuar fazendo o pedido.'
		let footer2 =
			`💬 ` + 'Ou se preferir digite #️⃣ para * Finalizar * o Pedido.'
		let _catalogo = gestor[pms.p]._produto._catalogo

		dados[user].stage = 2
		return [footer, footer2, _catalogo]
	}

	//Opção # - Fecha para a Forma de Entrega
	// stage = 3
	if (msg == '#') {
		let _header =
			`💬 ` +
			'Agora preciso que você me informe qual é a *forma de entrega* que deseja.'
		let _header2 = 'Caso deseja voltar para opção anterior, digite *Voltar*.'
		let _menu = gestor[pms.p]._menu_opcao.menu[2]
		dados[user].stage = 4
		return [_header, _header2, _menu]
	}

	dados[user].stage = 3
	return [`💬 ` + ' Digite uma opção válida!']
}

exports.execute = execute
