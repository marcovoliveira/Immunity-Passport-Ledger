'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./AppUtil.js');

const channelName = 'channel1';
const chaincodeName = 'hpCC';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'hpUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function setupConnection(){
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		return [ccp, wallet];
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

async function initLedger() {
	let [ccp, wallet] = await setupConnection();
	const gateway = new Gateway();
	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		});

		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('InitLedger');
		console.log('*** Result: committed');

	} finally {
		gateway.disconnect();
	}
}

async function readCertificate(hash) {
	let [ccp, wallet] = await setupConnection();
	const gateway = new Gateway();
	let result;
	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		});

		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		result = await contract.evaluateTransaction('ReadCertificate', hash);
	} catch (err) {
		let objErr = err;
		objErr.msg = err.toString();
		console.log(objErr);
		return '', objErr;
	} finally {
		gateway.disconnect();
	}
	return JSON.parse(result.toString()), null;
}

async function generateCertificate(data) {
	let [ccp, wallet] = await setupConnection();
	const gateway = new Gateway();
	let result;
	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		});
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		result = await contract.submitTransaction('CreateCertificate', data.hashHealthNumber, data.immunityDate, data.validity);
		console.log(`*** Result: ${prettyJSONString(result.toString())}`);
	} catch (err) {
		let objErr = err;
		objErr.msg = err.toString();
		console.log(objErr);
		return '', objErr;
	} finally {
		gateway.disconnect();
	}
	return JSON.parse(result.toString()), null;
}


module.exports = { initLedger, readCertificate, generateCertificate };


