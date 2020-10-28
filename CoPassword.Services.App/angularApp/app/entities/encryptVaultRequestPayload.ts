export class EncryptVaultRequestPayload {
    public publicKeyThumbprint: string;
    public decryptedVaultCypher: string;
    public symmetricKeyCypher: string;
    public symmetricKeyIv: string;

    static fromJS(data: any): EncryptVaultRequestPayload {
        return new EncryptVaultRequestPayload(data);
    }

    constructor(data?: any) {
        if (data !== undefined) {
            this.publicKeyThumbprint = data['publicKeyThumbprint'];
            this.decryptedVaultCypher = data['decryptedVaultCypher'];
            this.symmetricKeyCypher = data['symmetricKeyCypher'];
            this.symmetricKeyIv = data['symmetricKeyIv'];
        }
    }

    toJS(data?: any) {
        data = data === undefined ? {} : data;
        data['publicKeyThumbprint'] = this.publicKeyThumbprint;
        data['decryptedVaultCypher'] = this.decryptedVaultCypher;
        data['symmetricKeyCypher'] = this.symmetricKeyCypher;
        data['symmetricKeyIv'] = this.symmetricKeyIv;
        return data;
    }

    toJSON() {
        return JSON.stringify(this.toJS());
    }

    clone() {
        const json = this.toJSON();
        return new EncryptVaultRequestPayload(JSON.parse(json));
    }
}