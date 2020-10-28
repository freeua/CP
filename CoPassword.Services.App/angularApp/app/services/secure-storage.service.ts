import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { KeyData } from '../entities/keyData';


export interface ISecureStorageService {
    generateKeyPair(alias: string): Promise<void>;
    deleteKeyPair(alias: string): Promise<void>;
    encryptString(publicKey: string, data: string): Promise<string>;
    encryptByteArray(publicKeyString: string, data: ArrayBuffer): Promise<string>;
    exportPublicKey(alias: string): Promise<string>;
    exportPublicKeyPEM(alias: string): Promise<string>;
    decryptString(alias: string, encryptedData: string): Promise<string>;
    decryptByteArray(alias: string, encryptedData: string): Promise<ArrayBuffer>;
    createNewSymmetryKey(): Promise<KeyData>;
    encryptSymmetric(value: string, keyData: KeyData): Promise<string>;
    decryptSymmetric(cypherstring: string, keyData: KeyData): Promise<string>;
    arrayBufferToBase64String(arrayBuffer: ArrayBuffer): string;
    base64StringToBinaryArray(encoded: string): Uint8Array;
    stringToArrayBuffer(value: string): ArrayBuffer;
    stringToArrayBuffer(value: string): ArrayBuffer;
}

@Injectable()
export class SecureStorageService implements ISecureStorageService {

    private keys: CryptoKeyPair[] = new Array<CryptoKeyPair>();
    private crypto: SubtleCrypto;

    constructor() {
        this.crypto = window.crypto.subtle;
    }

    public async generateKeyPair(alias: string): Promise<void> {
        let keyPair = await this.crypto.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048, //can be 1024, 2048, or 4096
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: 'SHA-1' }, //can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ['encrypt', 'decrypt'] //must be ['encrypt', 'decrypt'] or ['wrapKey', 'unwrapKey']
        );
        this.keys[alias] = keyPair;
    }

    public async deleteKeyPair(alias: string): Promise<void> {
        let element = this.keys[alias];
        if (element !== null) {
            let index = this.keys.indexOf(element, 0);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
        }
    }

    public async exportPublicKey(alias: string): Promise<string> {
        let keyPair = this.keys[alias];

        let spki = await this.crypto.exportKey('spki', keyPair.publicKey)
        return this.arrayBufferToBase64String(spki);
    }

    public async exportPublicKeyPEM(alias: string): Promise<string> {
        let keyPair = this.keys[alias];

        let spki = await this.crypto.exportKey('spki', keyPair.publicKey)
        return this.convertBinaryToPem(spki, 'PUBLIC KEY');
    }

    public async encryptString(publicKeyString: string, data: string): Promise<string> {

        let arrayBufferToEncrypt = this.stringToArrayBuffer(data);
        return await this.encryptByteArray(publicKeyString, arrayBufferToEncrypt);
    }

    public async encryptByteArray(publicKeyString: string, data: ArrayBuffer): Promise<string> {
        let pubkeyBinary = this.base64StringToBinaryArray(publicKeyString); // todo currently no PEM support
        let hashName = 'SHA-1';

        let cryptokey = await this.crypto.importKey(
            'spki',
            pubkeyBinary,
            {
                name: 'RSA-OAEP',
                hash: {
                    name: hashName
                }
            }, false, ['encrypt']);
        let encrypted = await this.crypto.encrypt({ name: 'RSA-OAEP' }, cryptokey, data);
        return this.arrayBufferToBase64String(encrypted)
    }

    public async decryptString(alias: string, encryptedData: string): Promise<string> {
        let keyPair = this.keys[alias];

        let decryptedBuffer = await this.crypto.decrypt({ name: 'RSA-OAEP' }, keyPair.privateKey, this.base64StringToBinaryArray(encryptedData));

        return this.arrayBufferToString(decryptedBuffer);
    }

    public async decryptByteArray(alias: string, encryptedData: string): Promise<ArrayBuffer> {
        let keyPair = this.keys[alias];

        let decryptedBuffer = await this.crypto.decrypt({ name: 'RSA-OAEP' }, keyPair.privateKey, this.base64StringToBinaryArray(encryptedData));

        return decryptedBuffer;
    }


    // helper methods

    private convertBinaryToPem(binaryData: ArrayBuffer, label: string): string {
        let base64Cert = this.arrayBufferToBase64String(binaryData);

        let pemCert = '—–BEGIN ' + label + '—–\r\n';

        let nextIndex = 0;
        let lineLength;
        while (nextIndex < base64Cert.length) {
            if (nextIndex + 64 <= base64Cert.length) {
                pemCert += base64Cert.substr(nextIndex, 64) + '\r\n';
            } else {
                pemCert += base64Cert.substr(nextIndex) + '\r\n';
            }
            nextIndex += 64;
        }

        pemCert += '—–END ' + label + '—–\r\n';
        return pemCert;
    }

    public arrayBufferToBase64String(arrayBuffer: ArrayBuffer): string {
        let byteArray = new Uint8Array(arrayBuffer);
        let byteString = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            byteString += String.fromCharCode(byteArray[i]);
        }
        return btoa(byteString);
    }

    public base64StringToBinaryArray(encoded: string): Uint8Array {
        let decoded = window.atob(encoded);
        let byteArray = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
            byteArray[i] = decoded.charCodeAt(i);
        }
        return byteArray;
    }



    public stringToArrayBuffer(value: string): ArrayBuffer {
        let buf = new ArrayBuffer(value.length);
        let bufView = new Uint8Array(buf);
        for (let i = 0, strLen = value.length; i < strLen; i++) {
            bufView[i] = value.charCodeAt(i);
        }
        //return buf;
        return buf;
    }

    private arrayBufferToString(buffer: ArrayBuffer): string {
        let array = new Uint8Array(buffer);
        return String.fromCharCode.apply(null, new Uint16Array(array));
    }


    public async createNewSymmetryKey(): Promise<KeyData> {

        ////let salt = CryptoJS.WordArray.random(128 / 8);

        ////let key128Bits = CryptoJS.PBKDF2('Secret Passphrase', salt, { keySize: 128 / 32 });
        ////let key256Bits = CryptoJS.PBKDF2('Secret Passphrase', salt, { keySize: 256 / 32 });
        ////let key512Bits = CryptoJS.PBKDF2('Secret Passphrase', salt, { keySize: 512 / 32 });

        ////let key512Bits1000Iterations = CryptoJS.PBKDF2('Secret Passphrase', salt, { keySize: 512 / 32, iterations: 1000 });


        //let keyData = new KeyData();
        //keyData.iv = new Uint8Array(null);
        //keyData.key = new Uint8Array(null);
        //keyData.keySize = 128;

        //return keyData;

        let aesKey = await window.crypto.subtle.generateKey(
            { name: 'AES-CBC', length: 256 }, // Algorithm using this key
            true,                           // Allow it to be exported
            ['encrypt', 'decrypt']          // Can use for these purposes
        );

        let key = await window.crypto.subtle.exportKey('raw', aesKey);

        let iv = window.crypto.getRandomValues(new Uint8Array(16));

        let keyData = new KeyData();
        keyData.iv = new Uint8Array(iv.buffer);
        keyData.key = new Uint8Array(key);
        keyData.keySize = 256;

        return keyData;
    }

    public async encryptSymmetric(value: string, keyData: KeyData): Promise<string> {
        let aesKey = await window.crypto.subtle.importKey(
            'raw',
            keyData.key,
            { name: 'AES-CBC', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        let encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: keyData.iv },
            aesKey,
            this.stringToArrayBuffer(value)
        )

        return this.arrayBufferToBase64String(encrypted);
    }

    public async decryptSymmetric(cypherstring: string, keyData: KeyData): Promise<string> {
        let aesKey = await window.crypto.subtle.importKey(
            'raw',
            keyData.key,
            { name: 'AES-CBC', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        let decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: keyData.iv },
            aesKey,
            this.base64StringToBinaryArray(cypherstring)
        )

        return this.arrayBufferToString(decrypted);
    }
}

