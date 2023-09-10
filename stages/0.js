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

// Menu Inicial do Projeto
function execute(user, msg, client) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 0')

	dados[user]._type.type_option = 'image'
	dados[user]._type.type_file = 'welcome.png'

	let _menu = ''
	if (
		dados[user]._phone_name == '' ||
		dados[user]._phone_name == undefined ||
		dados[user]._phone_name == 'undefined'
	) {
		_menu = gestor[pms.p]._menu_opcao.menu[0]
	} else {
		_menu = gestor[pms.p]._menu_opcao.menu[1].replace(
			'|NameContact|',
			dados[user]._phone_name
		)
	}

	dados[user]._pedido._numero = ''
	dados[user]._pedido._itens = []
	dados[user].stage = 1
	return [_menu]
}

exports.execute = execute
