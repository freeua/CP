import { VaultDto, VaultKeyDto, UserDto, VaultFieldDto } from '@copassword/copassword.clients.secretmanagement';
import { EditableVaultField } from '../entities/editableVaultField'

export class EditableVault {

    /** public properties */
    public encryptedVault: VaultDto;

    public decryptedFields: Array<EditableVaultField>;
    get fields(): Array<EditableVaultField> {
        return this.decryptedFields;
    }

    public _decrypted: boolean;
    get decrypted(): boolean {
        return this._decrypted;
    }
    set decrypted(decrypted: boolean) {
        this._decrypted = decrypted;
    }

    static fromJS(data: any): EditableVault {

        if (data !== undefined) {

            let encryptedVault: VaultDto = data['encryptedVault'] ? VaultDto.fromJS(data['encryptedVault']) : undefined;
            let editableVault = new EditableVault(encryptedVault);
            editableVault.decryptedFieldsData = data['decryptedFieldsData'];
            editableVault.decrypted = data['decrypted'];

            return editableVault;
        } else {
            return undefined;
        }
    }

    constructor(encryptedVault: VaultDto) {
        if (encryptedVault == null) {
            this.encryptedVault = new VaultDto();
            this.encryptedVault.fields = Array<VaultFieldDto>();
            this.encryptedVault.keys = Array<VaultKeyDto>();
            this.decryptedFields = Array<EditableVaultField>();
            this.decrypted = false;
        } else {
            this.encryptedVault = encryptedVault;
            if (this.encryptedVault.fields == null) {
                this.encryptedVault.fields = Array<VaultFieldDto>();
            }
            if (this.encryptedVault.keys == null) {
                this.encryptedVault.keys = Array<VaultKeyDto>();
            }

            this.decrypted = false;
            this.decryptedFields = Array<EditableVaultField>();

            for (let encryptedField of this.encryptedVault.fields) {
                this.decryptedFields.push(new EditableVaultField(encryptedField));
            }
        }
    }

    /** wrapper */
    public GetDecryptedVaultField(fieldName: string): EditableVaultField {
        let field = this.fields.find(i => i.label == fieldName);
        return field;
    }

    get id(): string {
        return this.encryptedVault.id;
    }
    set id(id: string) {
        this.encryptedVault.id = id;
    }

    get name(): string {
        return this.encryptedVault.name;
    }
    set name(name: string) {
        this.encryptedVault.name = name;
    }

    get description(): string {
        return this.encryptedVault.description;
    }
    set description(description: string) {
        this.encryptedVault.description = description;
    }

    get encryptedFieldsData(): string {
        return this.encryptedVault.encryptedFieldsData;
    }
    set encryptedFieldsData(encryptedFieldsData: string) {
        this.encryptedVault.encryptedFieldsData = encryptedFieldsData;
    }

    get keys(): Array<VaultKeyDto> {
        return this.encryptedVault.keys;
    }
    set keys(keys: Array<VaultKeyDto>) {
        this.encryptedVault.keys = keys;
    }

    get decryptedFieldsData(): string {

        let map: Map<string, string> = new Map <string, string> ();

        this.fields.forEach(field => {
            map[field.id] = field.value;
        });

        return JSON.stringify(map);
    }
    set decryptedFieldsData(value: string) {

        if (value != null) {

            let fieldValuesJson = JSON.parse(value);

            this.fields.forEach(decryptedField => {


                if (Object.keys(fieldValuesJson).find(x => x === decryptedField.id) != undefined) {
                    decryptedField.value = fieldValuesJson[decryptedField.id];
                }
            });

            this.decrypted = true;
        } else {
            this.decrypted = false;
        }
    }

    toJS(data?: any) {
        data = data === undefined ? {} : data;
        data['encryptedVault'] = this.encryptedVault ? this.encryptedVault.toJSON() : undefined;
        data['decryptedFieldsData'] = this.decryptedFieldsData;
        data['decrypted'] = this.decrypted;

        return data;
    }

    toJSON() {
        return JSON.stringify(this.toJS());
    }

    clone() {
        const json = this.toJSON();
        return new EditableVault(JSON.parse(json));
    }

}