//// File Name: cryptohelper.js
//// Description: This has the methods decrypt & encrypt passwords
//// Version: 1.0

var kvservice = require('./keyVaultService');
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password;
	
var Exception = require('./logging.js');
kvservice.getSecret("encryptPassword", function (result) {
    password = result;
});

function cryptoHelper() {
	return {
		encrypt: encrypt,
		decrypt: decrypt,
        generatePassword:generatePassword
	};
};

function encrypt(text) {
	try {
		var cipher = crypto.createCipher(algorithm, password)
		var crypted = cipher.update(text, 'utf8', 'hex')
		crypted += cipher.final('hex');
		return crypted;
	}
	catch (exception) {
		Exception.logException({ "isServer": 1, "methodName": "encrypt", "exceptionDetails": exception.message, userId:'' });
	}
}

function decrypt(text) {
	try {
		var decipher = crypto.createDecipher(algorithm, password)
		var decrypted = decipher.update(text, 'hex', 'utf8')
		decrypted += decipher.final('utf8');
		return decrypted;
	}
	catch (exception) {
		Exception.logException({ "isServer": 1, "methodName": "decrypt", "exceptionDetails": exception.message, userId:'' });
	}
}

function generatePassword() {
    var length = 7,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
module.exports = cryptoHelper();