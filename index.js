const express = require('express');
const bodyParser = require('body-parser');
const Eureka = require('eureka-node-client');
const project_info = require('./package.json');
const eureka_config = require('./config/eureka-config.json');
const os = require('os');
const fs = require('fs');


//let hostname = os.hostname();
let hostname = 'yuuyoo-gamegate';
let port = 3000;

let eureka_address = process.env.EUREKA_ADDRESS || 'yuuyoo-eureka';
let eureka_port = process.env.EUREKA_PORT || '8761';
let eureka_username = process.env.EUREKA_USERNAME || 'admin';
let eureka_password = process.env.EUREKA_PWD || 'admin';

const eureka_client = new Eureka({
	eureka: {
		//host: `${eureka_username}:${eureka_password}@${eureka_address}`,
		port: `${eureka_port}`,
		host: `${eureka_address}`,
		servicePath: "/eureka/apps/",
		maxRetries: 5000
	},
	instance: {
	    app: project_info.name,
	    port: { '$': port, '@enabled': 'true' },
	    homePageUrl: `http://${hostname}:${port}/`,
	    healthCheckUrl: `http://${hostname}:${port}/health`,
	    statusPageUrl: `http://${hostname}:${port}/static/index.html`,
	    metadata: {
	    	zone: 'primary',
	    	env: process.env.NODE_ENV,
	    	version: project_info.version
	    }
	}
});

/**
 * 设置日志级别
 */
eureka_client.logger.level('debug');

//********************  测试监听  ********************//
let updatedListener = function(apps){
	console.log("更新：" + JSON.stringify(apps));
}
eureka_client.onUpdated(updatedListener);
eureka_client.start(function(error){
	if (error) {
		console.log(error);
		fs.writeFile('./eureka_logs.txt', error, {flag: 'w', encoding: 'utf-8'}, function(){});
	}else {
		console.log("启动成功！");
	}
});

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

app.get('/', (req, res) => {
	res.end("Hello World.");
});

app.get('/info', (req, res) => {
	console.log('GET /info');
	res.json({app_name: 'thomas-service'});
});

app.get('/health', (req, res) => {
	console.log('GET /health');
	res.json({
		status: 'RUNNING'
	});
});

app.get('/test',(req, res) => {
	console.log('test request');
	console.log(eureka_client);
	const appInfo = eureka_client.getInstancesByAppId('VALIDATE');
	console.log(appInfo);
	res.json(appInfo);
});

//user

app.post('/v2/users', (req, res) => {
	console.log(req.body);
	let body = req.body;
	body.id = 1;
	res.json(body);
});

app.get('/v2/users/:username', (req, res) => {
	res.json({
		id: "1",
		username: "测试用户",
		firstname: "thomas",
		lastname: "han",
		email: "thomas@han.com",
		phone: "18866321252",
		userstatus: 0 
	});
});

app.put('/v2/users/:username', (req, res) => {
	res.json(req.body);
});

app.delete('/v2/users/:username', (req, res) => {
	res.end();
});

app.listen(port, () => {
	console.log(`Server running at ${port}`);
});