import { VaultDto } from '@copassword/copassword.clients.secretmanagement';

export class EncryptVaultResponsePayload {
    public encryptedVault: VaultDto;

    static fromJS(data: any): EncryptVaultResponsePayload {
        return new EncryptVaultResponsePayload(data);
    }

    constructor(data?: any) {
        if (data !== undefined) {
            this.encryptedVault = data['encryptedVault'] ? VaultDto.fromJS(data['encryptedVault']) : undefined;
        }
    }

    toJS(data?: any) {
        data = data === undefined ? {} : data;
        data['encryptedVault'] = this.encryptedVault ? this.encryptedVault.toJSON() : undefined;
        return data;
    }

    toJSON() {
        return JSON.stringify(this.toJS());
    }

    clone() {
        const json = this.toJSON();
        return new EncryptVaultResponsePayload(JSON.parse(json));
    }
}