'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.fncAddDados =
	exports.fncListDados =
	exports.fncFindDados =
	exports.fncEditDados =
	exports.fncDelDados =
		void 0

const { GoogleSpreadsheet } = require('google-spreadsheet')

const credenciais = require('./guia-zap-presidente-dutra-oaek-48238adc98a4.json')
const permission = require('./permission.json')

const express = require('express')
const app = 'express'

// Credenciais com a Planilha
const getDoc = async () => {
	const doc = new GoogleSpreadsheet(permission.s)
	await doc.useServiceAccountAuth({
		client_email: credenciais.client_email,
		private_key: credenciais.private_key.replace(/\\n/g, '\n'),
	})
	await doc.loadInfo()
	return doc
}

// Add - Gravar dados
async function fncAddDados(title, data) {
	let sheetAdd
	return getDoc()
		.then(async (doc) => {
			sheetAdd = doc.sheetsByTitle[title]
			return await sheetAdd
				.addRow(data)
				.then(() => {
					return true
				})
				.catch(() => {
					return false
				})
		})
		.catch(() => {
			return false
		})
}

// Edit - Edição dos dados
async function fncEditDados(title, key, value, data) {
	let sheetEdit
	return getDoc()
		.then(async (doc) => {
			sheetEdit = doc.sheetsByTitle[title]
			let r = await sheetEdit
				.getRows()
				.then((rows) => {
					return rows.filter((row) => {
						if (row[key] === value) {
							for (let i in data) {
								row[i] = data[i]
							}
							return row.save()
						}
					})
				})
				.catch(() => {
					return false
				})
			if (r.length > 0) {
				return true
			} else {
				return false
			}
		})
		.catch(() => {
			return false
		})
}

// Delete - Exclusão dos dados
async function fncDelDados(title, key, value) {
	let sheetDel
	return getDoc()
		.then(async (doc) => {
			sheetDel = doc.sheetsByTitle[title]
			let r = await sheetDel
				.getRows()
				.then((rows) => {
					return rows.filter((row) => {
						if (row[key] === value) {
							return row.delete()
						}
					})
				})
				.catch(() => {
					return false
				})
			if (r.length > 0) {
				return true
			} else {
				return false
			}
		})
		.catch(() => {
			return false
		})
}

// List - Listar dados
async function fncListDados(title, data, key = null, value = null) {
	let sheetList
	return getDoc().then(async (doc) => {
		sheetList = doc.sheetsByTitle[title]
		let lista = await sheetList.getRows().then((rows) => {
			return rows.map((row) => {
				let dados = []
				for (let i in data) {
					if (key == null) {
						dados[i] = row[data[i]]
					} else {
						if (row[key] === value) {
							dados[i] = row[data[i]]
						}
					}
				}
				return dados
			})
		})

		let d = []
		let i = 0
		for (let x in lista) {
			if (lista[x].length > 0) {
				d[i] = lista[x]
				i++
			}
		}
		if (d.length > 0) {
			return d
		} else {
			return false
		}
	})
}

// Find - Localizar Dados
async function fncFindDados(title, key, value, retorno) {
	let sheetFind
	return getDoc()
		.then(async (doc) => {
			sheetFind = doc.sheetsByTitle[title]
			let r = await sheetFind.getRows().then((rows) => {
				return rows.map((row) => {
					if (row[key] === value) {
						return row[retorno]
					}
				})
			})

			let d = []
			for (let x in r) {
				if (r[x] != undefined) {
					d = r[x]
				}
			}

			if (d.length > 0) {
				return d
			} else {
				return false
			}
		})
		.catch(() => {
			return false
		})
}

exports.fncAddDados = fncAddDados
exports.fncEditDados = fncEditDados
exports.fncDelDados = fncDelDados
exports.fncListDados = fncListDados
exports.fncFindDados = fncFindDados
