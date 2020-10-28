export class DecryptVaultResponsePayload {
    public decryptedVaultCypher: string
    public symmetricKeyCypher: string;
    public symmetricKeyIv: string;

    static fromJS(data: any): DecryptVaultResponsePayload {
        return new DecryptVaultResponsePayload(data);
    }

    constructor(data?: any) {
        if (data !== undefined) {
            this.decryptedVaultCypher = data['decryptedVaultCypher'];
            this.symmetricKeyCypher = data['symmetricKeyCypher'];
            this.symmetricKeyIv = data['symmetricKeyIv'];
        }
    }

    toJS(data?: any) {
        data = data === undefined ? {} : data;
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
        return new DecryptVaultResponsePayload(JSON.parse(json));
    }
}