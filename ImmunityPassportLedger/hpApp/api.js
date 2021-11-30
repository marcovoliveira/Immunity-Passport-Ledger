'use strict';
const cfcController = require('./cfcController');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;


const corsOptions ={
	origin:'*',
	credentials:true,            //access-control-allow-credentials:true
	optionSuccessStatus:200
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/readCertificate', async (req, res) => {
	let result;
	let err;
	if(!req.body || !req.body.certificateHash || req.body.certificateHash === ''){
		return res.status(500).send();
	}

	result = await cfcController.readCertificateController(req.body);

	if(err) {
		return res.status(err.status).send(err);
	}
	return res.send(result);
});

app.post('/generateCertificate', async (req, res) => {
	let result;
	if(!req.body){
		return res.status(500).send();
	}

	result = await cfcController.createCertificateController(req.body);

	if(result.error) {
		return res.status(500).send(result.error);
	}
	return res.send(result);
	// return res.send({
	// 	qrcode: 'cHRfMjBlNzc5NWJkNzgwZjg1N2U1ZTZlNTFlOWMyNjQ0ZGQ5OGIyMDc5YTA1NTRkYmMwYjVmZTY0NzE0YTVmYzE2Yl8xMjM0NTY3ODlfMzgyMTINCg==',
	// 	email: req.body.email
	// });

});

//Create certificate

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});



