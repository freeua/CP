import { VaultDto } from '@copassword/copassword.clients.secretmanagement';

export class DecryptVaultRequestPayload {

    public publicKey: string;
    public vault: VaultDto;

    static fromJS(data: any): DecryptVaultRequestPayload {
        return new DecryptVaultRequestPayload(data);
    }

    constructor(data?: any) {
        if (data !== undefined) {
            this.publicKey = data['publicKey'];
            this.vault = data['vault'] ? VaultDto.fromJS(data['vault']) : undefined;
        }
    }

    toJS(data?: any) {
        data = data === undefined ? {} : data;
        data['publicKey'] = this.publicKey;
        data['vault'] = this.vault ? this.vault.toJSON() : undefined;
        return data;
    }

    toJSON() {
        return JSON.stringify(this.toJS());
    }

    clone() {
        const json = this.toJSON();
        return new DecryptVaultRequestPayload(JSON.parse(json));
    }
}