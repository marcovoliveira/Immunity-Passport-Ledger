'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('./AppUtil.js');

const channelName = 'channel1';
const chaincodeName = 'valCC';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const org2UserId = 'valUser';

async function setupConnection(){
	try {
		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		return [ccp, wallet];
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
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



module.exports = { readCertificate };


