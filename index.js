const Server = require('./src/server')

const app = new Server()


app.get('/', (req, res) => {
	res.send(req.query || 'Enter a query string')
})
app.post('/', (req, res) => {
	res.send(req.body)
	console.log(req.body)
})

app.all('500', (req, res, e) => {
	res.status(500).send('Internal server error')
	console.log(e)
})

app.listen(8080)