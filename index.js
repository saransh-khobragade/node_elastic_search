const express = require('express')
const app = express()
const server = require('http').createServer(app);
const bodyParser = require('body-parser')
const elastic_service = require('./elastic_service')
app.use(bodyParser());

app.get('/elastic/ping', async (req, res) => {
    elastic_service.ping(req, res);
});

app.post('/elastic/index/refresh', async (req, res) => {
    elastic_service.refresh_data(req, res);
});

app.post('/elastic/search', async (req, res) => {
    elastic_service.search(req, res);
});

server.listen(process.env.PORT || 1338,()=>{
    console.log('server running...at 1338');
});

