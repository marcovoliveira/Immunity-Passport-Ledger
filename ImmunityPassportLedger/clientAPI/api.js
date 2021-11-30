'use strict';
const cfcController = require('./cfcController');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 4000;


const corsOptions ={
	origin:'*',
	credentials:true,
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

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});



