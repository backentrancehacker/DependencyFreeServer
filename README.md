# Dependency Free Server (DFS)
Dependency free server modeled after express

## Usage
The DFS is extremely easy to use. After cloning the server into your local workspace, you can initialize it like so
```
const app = require('./src/server')()
```

## Routes
Currently only two possible methods are defined: GET and POST. Similar to express, you can create new routes with `.get` and `.post`. 
```
app.get('/', (req, res) => {
	res.send('Hello World')
})
app.post('/', (req, res) => {
	console.log(req.body || req.query)
	res.send('Hello World')
})
```
For ease of use, you can also define routes for both GET and POST with `.all`.
```
app.all('/', (req, res) => {
	res.send('Hello World')
})
```
At the moment, there are no route variables/pattern matching features.

## Response Methods
Supported methods include:
* res.redirect
* res.send
* res.sendFile
* res.status

## Request Variables
When applicable, you can access `req.query` for the query string and `req.body` for payloads.

## Start the App
```
app.listen(port, () => {
	console.log('Server Started')
})
```
`.listen` takes two parameters, the port and the callback (which is optional)