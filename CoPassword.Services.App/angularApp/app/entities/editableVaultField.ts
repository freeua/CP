import { VaultFieldDto, VaultFieldDtoType } from '@copassword/copassword.clients.secretmanagement';


export class EditableVaultField {
    public encryptedVaultField: VaultFieldDto;

    public _value: string = null;
    get value(): string {
        return this._value;
    }
    set value(value: string) {
        this._value = value;
    }

    constructor(encryptedVaultField: VaultFieldDto) {
        if (encryptedVaultField == null) {
            this.encryptedVaultField = new VaultFieldDto();
        } else {
            this.encryptedVaultField = encryptedVaultField;
        }
    }

    get id(): string {
        return this.encryptedVaultField.id;
    }
    set bar(id: string) {
        this.encryptedVaultField.id = id;
    }

    get label(): string {
        return this.encryptedVaultField.label;
    }
    set label(label: string) {
        this.encryptedVaultField.label = label;
    }

    get type(): VaultFieldDtoType {
        return this.encryptedVaultField.type;
    }
    set type(type: VaultFieldDtoType) {
        this.encryptedVaultField.type = type;
    }

    get encrypted(): boolean {
        return this.encryptedVaultField.encrypted;
    }
    set encrypted(encrypted: boolean) {
        this.encryptedVaultField.encrypted = encrypted;
    }

    get position(): number {
        return this.encryptedVaultField.position;
    }
    set position(position: number) {
        this.encryptedVaultField.position = position;
    }

    get valueString(): string {
        return this.value;
    }
    set valueString(valueString: string) {
        this.value = valueString;
    }

}