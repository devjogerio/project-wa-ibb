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
const fs = require('fs')

// Apresentação das Opções do Menu Principal
function execute(user, msg, client) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 1')

	// Opção * - Cancelamento do Pedido
	// stage 0
	// if (msg === '*' && dados[user]._human == false) {
	// 	return fnc.fncgetFinish(user)
	// }

	let _msgRetorno = []
	if (msg.toLowerCase() == 'voltar' && dados[user]._human == false) {
		dados[user].stage = 0
		return ['Estágio: ' + dados[user].stage]
	}

	if (
		dados[user]._phone_name == '' ||
		dados[user]._phone_name == undefined ||
		dados[user]._phone_name == 'undefined'
	) {
		if (dados[user]._phone_incl == '' && msg == '1') {
			dados[user].stage = 1
			dados[user]._phone_incl = '1'
			return [`💬 ` + ' Para comerçarmos por favor, *informe o seu nome*']
		}
		if (dados[user]._phone_incl == '1') {
			dados[user]._phone_incl = '0'
			dados[user]._phone_name = msg
			let _editCliente = {
				NomeCliente: msg,
				NomeInformado: msg,
			}
			db.fncEditDados('Clientes', 'Codigo', dados[user]._id_user, _editCliente)
			msg = '1'
		}
	}

	// 1ª Verificação - Verifica se o valor informado está permitido ou se é inválido!
	// Stage = 1

	if (
		!gestor[pms.p]._menu_opcao.value[0]['0'].includes(msg) &&
		dados[user]._human == false
	) {
		_msgRetorno = [`💬 ` + '❌ Opção inválida, tente novamente!']
		dados[user].stage = 1
		return _msgRetorno
	}

	// Opção 0 - Finalizar
	if (msg == '0' && dados[user]._human == false) {
		return fnc.fncgetFinish(user)
	}

	let header = ``
	let conteudo = ``
	let msgText1 = ''
	let msgText2 = ''

	//  apresentar Catalogo de produtos para pesquisa
	if (msg == '10' && dados[user]._human == false) {
		dados[user]._type.type_option = 'image'
		dados[user]._type.type_file = 'capa-akmos.jpg'
		let _catalogo = gestor[pms.p]._produto._searchAnuncio_list
		msgText1 =
			'💬 ' +
			'Para realizar uma *pesquisa mais detalhada* Informe o *código* do anunciante.'
		msgText2 = '💬 ' +
			'Ou se preferir digite *️⃣ para voltar para o menu principal.'

		dados[user].stage = 2
		_msgRetorno = [_catalogo, msgText1, msgText2]

		return _msgRetorno
	}

	// Opção 2 - Pesquisar Anuncio
	// Stage  8
	if (msg == '2' && dados[user]._human == false) {
		dados[user].stage = 8
		_msgRetorno = [
			`🧾 ` + ` *Pesquisando anúncio(s)...*`,
			`💬 ` + `Por favor informe o código do *anunciante*.`,
		]
		return _msgRetorno
	}

	// Opção 3 - Listar Card das Promoções
	// Stage = 1
	if (msg == '3' && dados[user]._human == false) {
		let _textPromocao = `💬 ` + ' Aqui estão os nossos produtos na promoção...'
		dados[user]._promotion = true
		dados[user].stage = 1
		return [_textPromocao]
	}

	// Opção 4 - Falar com atendente
	// Stage = 1
	if (msg == '4' && dados[user]._human == false) {
		dados[user]._type.type_option = 'contato'

		let msg =
			`💬 ` +
			`_Para falar com um dos nossos atendentes, por favor mande uma mensagem para o contato abaixo._ \n `
		let msg2 = ' 💬 ' + 'E para finalizar o seu atendimento basta digitar 0️⃣.'
		return [msg, msg2]
	}

	if (msg == '*') {
		dados[user]._type.type_option = 'chat'
		let msgMessage =
			`💬 ` + `Oi, agora o seu atendimento é pelo *assistente virtual*.\n`
		msgMessage += gestor[pms.p]._menu_opcao.menu[4]
		dados[user]._human = false
		dados[user]._human_chat = false
		dados[user].stage = 1
		return [msgMessage]
	}

	// Opção 5 - Nossa Localização
	// Stage = 1
	if (msg == '5' && dados[user]._human == false) {
		header = `💬 ` + `"Que legal, vou te passar a nossa localização!` + '\n'
		header += `📌 *ENDEREÇO* \n`
		header += `💬 ` + `_Nosso endereço de localização._ \n`
		conteudo = `------------------------------ -` + `\n`
		conteudo += `*${pms.address}* \n`
		conteudo += `Cep: *${pms.zip}* \n`
		conteudo += `Município: *${pms.city}* \n`
		conteudo += `Estado: *${pms.state}* \n`
		conteudo += `------------------------------ -` + `\n`
		let msgOpcao = header
		;+conteudo

		// dados[user]._type.type_option = 'adress';
		dados[user]._type.type_option = 'location'
		dados[user].stage = 1
		return [msgOpcao]
		return [`${pms.address}, ${pms.zip} - ${pms.city} / ${pms.state}`, msgOpcao]
	}

	// 2ª Verificação - Caso chegou aqui houve um erro, e será inicializado o atendimento
	// Stage <- 0
	dados[user].stage = 1
	return [`💬 ` + ' Digite uma opção válida e tente novamente!']
}

exports.execute = execute
