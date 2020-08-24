const fs = require('fs').promises
const path = require('path')

const walk = async dir => {
	let files = await fs.readdir(dir)
	files = await Promise.all(files.map(async file => {
		const filePath = path.join(dir, file)
		const stats = await fs.stat(filePath)
		if(stats.isDirectory()) return walk(filePath)
		else if(stats.isFile()) return filePath
	}))
	return files.reduce((all, folders) => all.concat(folders), [])
}

const cookies = {
	parse: (cookie) => {
		let r = /([^;=\s]*)=([^;]*)/g
		let obj = {}
		for(let m; m = r.exec(cookie);) {
			obj[m[1]] = decodeURIComponent(m[2])
		}
		return obj
	},
	stringify: (cookie) => {
		let list = []
		for(const [key, value] of Object.entries(cookie)) {
			list.push(`${key}=${encodeURIComponent(value)}`)
		}
		return list.join('; ')
	}
}

const type = {
	'.html': 'text/html',
	'.js':   'text/javascript',
	'.css':  'text/css',
	'.json': 'application/json',
	'.png':  'image/png',
	'.jpg':  'image/jpg',
	'.gif':  'image/gif',
	'.svg':  'image/svg+xml',
	'.wav':  'audio/wav',
	'.mp4':  'video/mp4',
	'.woff': 'application/font-woff',
	'.ttf':  'application/font-ttf',
	'.eot':  'application/vnd.ms-fontobject',
	'.otf':  'application/font-otf',
	'.wasm': 'application/wasm'
}

const clean = json => JSON.parse(JSON.stringify(json))

module.exports = {
	walk,
	cookies,
	type,
	clean
}