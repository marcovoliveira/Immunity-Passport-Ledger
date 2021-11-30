'use strict';

const sdk = require('./app');

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



module.exports = { readCertificateController };