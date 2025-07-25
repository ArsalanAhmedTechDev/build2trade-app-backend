var CryptoJS = require("crypto-js");


function decrypt(data) {
    
    let decryptData =''
    if(data){
        decryptData = CryptoJS.AES.decrypt(data, process.env.CRYPTO_SECERT_KEY).toString(CryptoJS.enc.Utf8)
        decryptData = JSON.parse(decryptData)
        //console.log("Decrypt-1: "+JSON.stringify(decryptData));
    }

    return decryptData;
}


function encrypt(data) {
    // let ecryptData =''
    // if(data){
    //     ecryptData = CryptoJS.AES.encrypt(data, process.env.CRYPTO_SECERT_KEY)
    //     console.log("Decrypt-2: "+ecryptData);
    // }

    // return ecryptData;
}


module.exports = {
    decrypt,
    encrypt,
}