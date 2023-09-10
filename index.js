'use strict';
Object.defineProperty(exports, '__esModule', { value: true });

const __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : {default: mod};
	};

const Whatsapp = require('@wppconnect-team/wppconnect');
const myTokenStore = new Whatsapp.tokenStore.FileTokenStore({
	decodefunction: JSON.parse,
	encodefunction: JSON.stringify,
	encoding: 'utf8',
	fileExtension: '.json',
	path: './tokens'
});

// PROJECT NAME TO GENERATE THE KEY.JSON
const _project = 'guia-phb';

const pms = require('./interface/permission.json');
const gestor = require('./models/_gestor');

const db = require('./interface/db_Sheets');
const fnc = require('./helpers/helpers');
const dados = require('./models/_dados');
const { step } = require('./models/_stages');

const cliente = Whatsapp.create({
	session: _project,
	puppeteerOptions: { userDataDir: './tokens/' + _project + '.data.key.json/' },
	tokenStore: myTokenStore,
	catchQR: (asciiQR, attempts, urlCode) => {},
	statusFind: (statusSession, session) => {
		console.log('Status da Sessão: ', statusSession, '\n');
		console.log('Nome da Sessão: ', session, '\n');
	},
	headless: true,
	devtools: false,
	useChrome: true,
	debug: false,
	logQR: true,
	disableSpins: true,
	disableWelcome: true,
	updatesLog: true,
	autoClose: 60000,
	waitForLogin: true
});

Whatsapp.defaultLogger.level = 'silly';

cliente
	.then((client) => {
		fnc.fncgetGestor(pms.p);
		start(client);
	})
	.catch((erro) => {
		console.log(erro);
	});

async function start(client) {
	await client.page.waitForSelector('#app');
	await client.page.evaluate(() => document.querySelector('#app').remove());

	await client.onStateChange((state) => {
		console.log('State changed: ', state);
		if ('CONFLICT'.includes(state)) client.useHere();
		if ('UNPAIRED'.includes(state)) console.log('logout');
	});

	await client.onIncomingCall(async (call) => {
		console.log(call);
		await client.sendText(
			call.peerJid,
			'Olá, no presente momento não estamos atendendo as chamadas! Obrigado!\n\n' +
				'Para falar com um de nossos atendentes digite o nº *4*, e aguarde.'
		);
	});

	await client.onMessage(async (message) => {
		if (typeof message != 'undefined') {
			await client.startTyping(message.from);
		}

		if (
			fnc.fncgetStage(message.from) === 0 &&
			dados[message.from]._id_user === 0
		) {
			dados[message.from]._phone_num = message.from.split('@')[0];
			if (dados[message.from]._phone_num.length === 12) {
				dados[message.from]._phone_num = ((String(`${message.from}`).split('@')[0]).substr(3));
				dados[message.from]._phone_num = ((String(`${message.from}`)));
			}

			await (async () => {
				// Lista de contatos de redirecionamento
				gestor[pms.p]._phone_redirect = await db.fncListDados(
					'_redirect',
					['phone'],
					'phone_ativo',
					'Sim'
				);
				if (dados[message.from]._id_user === 0) {
					// 1st Verification - Checks if the User is Registered
					let _id_user = '';
					let _tbCliente = 'Clientes';
					let _user = await db.fncListDados(
						_tbCliente,
						['Codigo', 'NomeCliente'],
						'Phone',
						dados[message.from]._phone_num
					);

					if (!_user) {
						_id_user = await db.fncFindDados(
							'_register',
							'Tabela',
							_tbCliente,
							'ID'
						);
						dados[message.from]._phone_name = message.sender.pushname;
						let _addCliente = {
							Codigo: _id_user,
							Status: 'Sim',
							Phone: dados[message.from]._phone_num,
							NomeCliente: dados[message.from]._phone_name
						};
						await db.fncAddDados(_tbCliente, _addCliente);
					} else {
						_id_user = _user[0][0];
						dados[message.from]._phone_name = _user[0][1];
					}

					dados[message.from]._id_user = _id_user;

					console.log(
						'>>> Capturing the Customer: ',
						_id_user + ' - ' + dados[message.from]._phone_name
					);
				}
			})();
		}

		dados[message.from]._message = message;

		let resp = step[fnc.fncgetStage(message.from)].obj.execute(
			message.from,
			message.body
		);

		for (let index = 0; index < resp.length; index++) {
			const element = resp[index];
			// Habilitar o atendimento humano
			if (dados[message.from]._human === true) {
				//Prepara a mensagem de informação que será o atendente humano
				if (dados[message.from]._human_chat === false) {
					dados[message.from]._human_chat = true;
					await client.sendText(message.from, element);
				}

				//Prepare the message from whoever will answer
				if (dados[message.from]._human_atend !== '') {
					await fnc.sleep(4000);
					await client.sendText(message.from, dados[message.from]._human_atend);
					dados[message.from]._human_atend = '';
				}
			} else {
				dados[message.from]._human_chat = false;
				if (dados[message.from]._type.type_option === 'chat') {
					await client.sendText(message.from, element);
				} else if (dados[message.from]._type.type_option === 'image') {
					await client.sendImage(
						message.from,
						'img/' + dados[message.from]._type.type_file,
						dados[message.from]._type.type_name,
						element
					);
				} else if (dados[message.from]._type.type_option === 'location') {
					await client.sendLocation(message.from, pms.lat, pms.lng, element);
				} else if (dados[message.from]._type.type_option === 'contato') {
					await client.sendText(message.from, element);
					await client.sendContactVcard(
						message.from,
						pms.atend_phone,
						pms.atend
					);
				} else if (dados[message.from]._type.type_option == 'adress') {
					await client.sendLocation(
						message.from,
						'-13.6561589',
						'-69.7309264',
						'Brasil',
						element
					);
				}
			}

			dados[message.from]._type.type_option = 'chat';
			// Gerar um intervalo personalizado Sleep.
			if (dados[message.from].sleep > 0) {
				await fnc.sleep(dados[message.from].sleep * 5000);
				dados[message.from].sleep = 0;
			}

			//lista da promoção
			if (dados[message.from]._promotion == true) {
				for (let x in gestor[pms.p]._produto_promotion) {
					await client.sendImage(
						message.from,
						'img/Promocoes/' + gestor[pms.p]._produto_promotion[x][4],
						gestor[pms.p]._produto_promotion[x][4],
						'_' + gestor[pms.p]._produto_promotion[x][1] + '_'
					);
				}
				await client.sendText(
					message.from,
					'' + ' Caso você queira receber nossas novidades, cadastre-se.'
				);
				dados[message.from]._promotion = false;
			}

			//Resultado da pesquisa de produtos
			if (dados[message.from]._search_anuncio.length > 0) {
				for (let x in dados[message.from]._search_anuncio) {
					await client.sendLinkPreview(
						`${message.from}`,
						dados[message.from]._search_anuncio[x][4] +
							'\n' +
							`------------------------------------------------------------` +
							'\n' +
							'*Código do anúncio*: ' +
							dados[message.from]._search_anuncio[x][0] +
							'\n' +
							`------------------------------------------------------------` +
							'\n' +
							'*Anunciante:*  ' +
							dados[message.from]._search_anuncio[x][1] +
							'\n' +
							`------------------------------------------------------------` +
							'\n' +
							'*Descição do anúncio:*' +
							'\n' +
							dados[message.from]._search_anuncio[x][3] +
							'\n' +
							`------------------------------------------------------------` +
							'\n' +
							`Acesse o Catálogo de ${
								'*' + dados[message.from]._search_anuncio[x][1] + '*'
							} no WhatsApp`
					);
				}

				await client.sendText(
					message.from,
					`💬 ` +
						' Para continuar pesquisando digite um novo termo para pesquisar os anúncios.'
				);

				await client.sendText(
					message.from,
					`💬 ` + 'Ou digite *️⃣ para voltar para o menu'
				);
				dados[message.from]._search_anuncio = [];
			}
		}

		if (typeof message != 'undefined') {
			await client.stopTyping(message.from);
		}
	});
}

exports.cliente = cliente;
