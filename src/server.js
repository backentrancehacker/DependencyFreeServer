const { createServer } = require('http')

const query = require('querystring')
const path = require('path')
const url = require('url')
const fs = require('fs')

const utils = require('./utils')

class Server {
	constructor() {
		this.routes = this.config('get', 'post')
		this.server = this.initialize()
		this.attrs = {}
		return this
	}
	serve(dir) {
		utils.walk(dir).then(files => {
			files.forEach(file => {
				this.all(file.replace(dir, ''), (req, res) => res.sendFile(file))
			})
		})
	}
	set(attr, val) {
		this.attrs[attr.toLowerCase().replace(/ /g, '_')] = val
	}
	process(cb) {
		return ((...params) => {
			const [req, res] = params
			try {
				cb.apply(null, params)
			}
			catch(e) {
				const { pathname } = url.parse(req.url)				
				const exec = this.routes[req.method]['500'] || ((req, res) => res.status(500).send('Internal server error'))
				
				exec(req, res, e)
			}
		})
	}
	all(pathname, cb) {
		for(const route in this.routes) {
			this.routes[route][pathname] = this.process(cb)
		}
	}
	config(...types) {
		let routes = {}
		for(let type of types) {
			routes[type.toUpperCase()] = {}
			Server.prototype[type] = (pathname, cb) => {
				if(typeof pathname == 'string') pathname = [pathname]
				for(const r of pathname) {
					this.routes[type.toUpperCase()][r.toString()] = this.process(cb)
				}
			}
		}
		return routes
	}
	resMethods(res) {
		const add = {
			status: code => {
				res.statusCode = code
				return Object.assign({}, res, add)
			},
			send: (data, headers={}) => {
				for(const key in headers) {
					res.setHeader(key, headers[key]);
				}
				if(typeof data == 'string') {
					res.end(data, 'utf-8')
				}
				else {
					res.end(JSON.stringify(data), 'utf-8')
				}
			},
			redirect: (pathname) => {
				add.status(302).send(null, {
					'Location': pathname
				})
			},
			sendFile: (file) => {
				file = path.join(this.attrs.views || '', file)
				const ext = String(path.extname(file))
				const content = utils.type[ext] || 'application/octet-stream'
				const headers = {
					'Content-Type': content
				}
				if (fs.existsSync(file)) {
					res.writeHead(200, headers)
					fs.createReadStream(file).pipe(res)				
				}
				else {
					throw new Error('File does not exist')
				}
			},
			render: (file, json) => {
				file = path.join(this.attrs.views || '', file)
				const ext = String(path.extname(file))
				const content = utils.type[ext] || 'application/octet-stream'
				const headers = {
					'Content-Type': content
				}
				if (fs.existsSync(file)) {
					let details = fs.readFileSync(file, 'utf-8')
					for(const key in json) {
						let p = new RegExp(`{{${key}}}`, 'g')
						details = details.replace(p, json[key])
					}
					res.send(details, headers)
				}
				else {
					throw new Error('File does not exist')
				}
			}
		}
		return add
	}
	async reqMethods(req) {
		const add = {}

		if(req.method == 'POST') {
			const body = await new Promise((resolve, reject) => {
				let data = []
				req.on('data', chunk => {
					data.push(chunk)
				})
				req.on('end', () => {
					resolve(data)
				})
			})
			switch(req.headers['Content-Type']) {
				case 'application/x-www-form-urlencoded': 
					add.query = query.parse(body)
					break
				case 'application/json': 
					add.body = JSON.parse(body)
					break
				default:
					add.body = body.toString()
			}
		}
		else if(req.method == 'GET') {
			const body = url.parse(req.url, { parseQueryString: true }).query
			add.query = body
		}
		return add
	}
	initialize() {
		const server = createServer()

		server.on('request', async (req, res) => {
			const { pathname } = url.parse(req.url)
			const exec = this.routes[req.method][pathname || '404'] || ((req, res) => res.status(404).send(`Could not ${req.method} ${pathname}`))
			
			Object.assign(res, this.resMethods(res))
			Object.assign(req, await this.reqMethods(req))
			exec(req, res)
		})

		return server
	}
	listen(port, cb) {
		this.server.listen(port, cb || null)
	}
}

module.exports = Server