const HEX_CHARACTERS = '0123456789abcdef';

function toHex(byteArray) {
    const hex = [];
    byteArray.forEach(function(b) {
        hex.push(HEX_CHARACTERS.charAt(b >> 4 & 0xf));
        hex.push(HEX_CHARACTERS.charAt(b & 0xf));
    });
    return hex.join('');
}

function fromHex(str) {
    if(typeof str !== 'string') {
        return [];
    }
    const byteArray = [];
    const characters = str.split('');
    for(let i = 0; i < characters.length; i += 2) {
        byteArray.push(HEX_CHARACTERS.indexOf(characters[i]) << 4 | HEX_CHARACTERS.indexOf(characters[i + 1]));
    }
    return byteArray;
}

function rc4(keyByteArray, inputByteArray) {
    let s = [],
        i,
        j,
        x, outputByteArray = [];

    for(i = 0; i < 256; i++) {
        s[i] = i;
    }

    for(i = 0, j = 0; i < 256; i++) {
        j = (j + s[i] + keyByteArray[i % keyByteArray.length]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }

    for(let y = 0, i = 0, j = 0; y < inputByteArray.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        outputByteArray.push(inputByteArray[y] ^ s[(s[i] + s[j]) % 256]);
    }
    return outputByteArray;
}

function stringToByteArray(str) {
    const encoded = encodeURIComponent(str);
    const characters = encoded.split('');
    const byteArray = [];
    for(let i = 0; i < characters.length; i++) {
        if(characters[i] === '%') {
            byteArray.push(HEX_CHARACTERS.indexOf(characters[i + 1].toLowerCase()) << 4 | HEX_CHARACTERS.indexOf(characters[i + 2].toLowerCase()));
            i += 2;
        } else {
            byteArray.push(characters[i].charCodeAt(0));
        }
    }
    return byteArray;
}

function byteArrayToString(byteArray) {
    let encoded = '';
    for(let i = 0; i < byteArray.length; i++) {
        encoded += '%' + HEX_CHARACTERS.charAt(byteArray[i] >> 4 & 0xf) + HEX_CHARACTERS.charAt(byteArray[i] & 0xf);
    }
    return decodeURIComponent(encoded);
}

const rc4Api = {
    encrypt: function(key, str) {
        return toHex(rc4(stringToByteArray(key), stringToByteArray(str)));
    },

    decrypt: function(key, str) {
        return byteArrayToString(rc4(stringToByteArray(key), fromHex(str)));
    }
};

module.exports = rc4Api;
