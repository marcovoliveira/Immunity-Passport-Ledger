'use strict';

const sdk = require('./app');
const saltedSha256 = require('salted-sha256');
const crypto = require('crypto');


async function createCertificateController(data) {
	let result = {};
	let err;

	let immunityDate = Date.now();
	let validity = data.validity;

	let salt = crypto.randomBytes(16).toString('base64');
	let hashHealthNumber = saltedSha256(data.healthNumber, salt);

	result, err = await sdk.generateCertificate({hashHealthNumber, immunityDate, validity});

	if(err) {
		return {
			error: err
		};
	}
	// Send email data.email

	let responseToEncode = {
		healthNumber: data.healthNumber,
		salt: salt,
		Issuer: result.issuer
	};


	const base64Response = Buffer.from(JSON.stringify(responseToEncode)).toString('base64');
	let response = {
		result: base64Response,
		email: data.email,
		error: null
	};

	return response;
}


async function readCertificateController(data) {
	let result;
	let err;
	let hash = data.certificateHash;

	result, err = await sdk.readCertificate(hash);
	if(err) {
		return {
			error: err
		};
	}

	let formatedImmunityDate = new Date(result.immunityDate);

	formatedImmunityDate.setDate(formatedImmunityDate.getDate() + result.validaty);

	if(formatedImmunityDate < Date.now()){
		return true;
	}

	return false;
}



module.exports = { createCertificateController, readCertificateController };