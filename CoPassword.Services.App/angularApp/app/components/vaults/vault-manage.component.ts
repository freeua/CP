import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  UserDto, VaultDto, VaultFieldDto, VaultFieldDtoType, VaultTemplateDto, VaultTemplateFieldDto, VaultTemplateFieldDtoType
} from '@copassword/copassword.clients.secretmanagement';
import {
  ComponentInModal, DynamicFormComponent, FieldConfig, IComponentInModal, ITableActions,
  ITableSettings, ModalActions,
  ModalButtonPosition, ModalSettings, SettingsService
} from '@4tecture/ui-controls';
import { UserDto as UserAccount } from '@copassword/copassword.clients.usermanagement';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { EditableVault } from '../../entities/editableVault';
import { SecureStorageService } from '../../services/secure-storage.service';
import { ClientVaultService } from '../../services/client-vault.service';
import { VaultService } from '../../services/vault.service';
import { UUID } from 'angular2-uuid';

declare const swal: any;

@Component({
  selector: 'app-vault-manage',
  templateUrl: './vault-manage.component.html'
})

export class VaultManageComponent implements OnInit {

  @Input() user: UserAccount;
  @ViewChild('dynamicForm')
  private _vaultTemplateComponent: DynamicFormComponent;
  private editMode: boolean;
  public vaultTitle: string;
  public formModal: IComponentInModal;
  public vaultSettings: ITableSettings;
  public modalFields = Array<FieldConfig>();
  public vaultModalSettings: IComponentInModal;
  public vaultEditControlMethods: ITableActions[];
  public deleteFieldBind: Function = this.deleteField.bind(this);
  public changeQuickCopyStateBind: Function = this.changeQuickCopyState.bind(this);
  public changeEncryptionStatusBind: Function = this.changeEncryptionStatus.bind(this);
  public detectCallMethodBind: Function = this.detectCallMethod.bind(this);
  public defaultVaultSettings = Array<{ id: string, label: string, position: number, type: string, value: string }>();
  public vault: EditableVault;
  private _fields = Array<any>();
  private types = [
    { field: 'single_line', type: VaultTemplateFieldDtoType.SingleLineText },
    { field: 'multi_line', type: VaultTemplateFieldDtoType.MultiLineText },
    { field: 'icon', type: VaultTemplateFieldDtoType.Icon },
    { field: 'single_line', type: VaultTemplateFieldDtoType.Email },
    { field: 'password', type: VaultTemplateFieldDtoType.Password },
    { field: 'single_line', type: VaultTemplateFieldDtoType.Url },
    { field: 'single_line', type: VaultTemplateFieldDtoType.SingleDate },
    { field: 'expire', type: VaultTemplateFieldDtoType.ExpirationDate },
    { field: 'tags', type: VaultTemplateFieldDtoType.Tags }
  ];

  get fields(): any[] {
    return this._fields;
  }

  set fields(fields: any[]) {
    this.initModalFields(fields);
    this._fields = fields;
  }

  constructor (
    private readonly _settingsService: SettingsService,
    private readonly _translate: TranslateService,
    private readonly _secureStorageService: SecureStorageService,
    private readonly _clientVaultServiceClient: ClientVaultService,
    private readonly _clientVaultService: ClientVaultService,
    private readonly _vaultService: VaultService
  ) { }

  ngOnInit () {

    /** UI modal settings for vaultTemplateSettings */
    this.vaultModalSettings = new ComponentInModal({
      methods: [
        new ModalActions({ description: 'Back' }),
      ],
      settings: new ModalSettings({
        title: this.vaultTitle,
        editMode: true
      })
    });

    /** Control methods for vault fields*/
    this.vaultEditControlMethods = [
      {
        function: this.changeQuickCopyStateBind,
        switchIcon: {
          from: 'hasQuickCopy',
          params: [ { key: false, value: 'far fa-square' }, { key: true, value: 'far fa-check-square' } ]
        }
      },
      {
        function: this.changeEncryptionStatusBind,
        switchIcon: {
          from: 'encrypted',
          params: [ { key: false, value: 'fas fa-unlock' }, { key: true, value: 'fas fa-lock' } ]
        }
      },
      { function: this.deleteFieldBind, icon: 'far fa-trash-alt' }
    ];

    /** UI table options for vault */
    this.vaultSettings = {
      params: [
        { property: 'label', title: 'Label', edit: true },
        { property: 'type', title: 'Type', edit: false },
      ],
      dragName: 'vaultManage'
    };

    /** UI Modal settings for dynamic fields */
    this.formModal = new ComponentInModal({
      methods: [
        new ModalActions({ description: 'Create', function: this.detectCallMethodBind, active: false }),
        new ModalActions({ description: 'Edit', switchModal: this.vaultModalSettings.settings, position: ModalButtonPosition.top }),
      ],
      settings: new ModalSettings({
        title: this.vaultModalSettings.settings.title
      })
    });

    /** Set value for diff template fields */
    this._settingsService.event.subscribe(result => {
      if (result.event === 'form_changes') {
        this.setValueInGlobalVariable(result.data);
      }
      if (result.event === 'close') {
        if (this.formModal.settings.id === result.data.id) {
          this._clientVaultService.stopWaiting();
          this.formModal.settings.waiting = false;
          this.formModal.methods[0].active = false;
        }
      }
      if (result.event === 'change_description_modal') {
        this.vaultTitle = result.data;
        this.formModal.settings.title = result.data;
      }
      if (result.event === 'change_item_cell') {
        this.initModalFields(this.fields);
      }
      if (result.event === 'drag') {
        this.fields = result.data;
      }
    });

    this.vaultModalSettings.methods[0].switchModal = this.formModal.settings;

  }

  /**
   * Open modal for create vault
   */
  public openVaultModalForCreate (template: VaultTemplateDto) {
    this.editMode = false;
    this._vaultTemplateComponent.form.reset();
    this.modalFields = Array<FieldConfig>();
    this.formModal.settings.showModal = true;
    this.formModal.settings.title = template.name;
    this.vaultModalSettings.settings.title = template.name;
    this.formModal.methods[0].active = false;
    this.formModal.methods[0].description = 'Create';
    this.fields = JSON.parse(JSON.stringify(template.vaultTemplateFields));
  }

  /**
   * Open modal for update vault
   */
  public openVaultModalForUpdate (data: any) {
    this.editMode = true;
    const vault = data.vault;
    const vaultLevel = data.elem;
    const editableVault = new EditableVault(vault);
    this._vaultTemplateComponent.form.reset();
    this.modalFields = Array<FieldConfig>();
    this.formModal.settings.showModal = true;
    this.formModal.methods[0].active = false;
    this.formModal.methods[1].active = false;
    this.formModal.settings.title = vault.name;
    this.formModal.methods[0].description = 'Update';
    this.vaultModalSettings.settings.title = vault.name;
    this.fields = JSON.parse(JSON.stringify(vault.fields));
    this.decryptAndSetValue(vault, editableVault);
  }

  /**
   * Decrypt vault and set values in the form
   */
  private decryptAndSetValue (vault: VaultDto, editableVault: EditableVault ) {
    this.formModal.settings.waiting = true;
    this.defaultVaultSettings = Array();
    this._vaultService.checkDecryptedVault(editableVault).then(decryptVault => {

      let forDecryptFields = {};

      vault.fields.forEach(field => {
        const getDecryptValue = decryptVault.decryptedFields.find(decryptField => decryptField.id === field.id);

        if (getDecryptValue.type === VaultFieldDtoType.Tags) {
          forDecryptFields[field.id] = getDecryptValue.value.split(' ');
          return false;
        }

        if (getDecryptValue.type === VaultFieldDtoType.SingleDate) {
          forDecryptFields[field.id] = getDecryptValue.value ? getDecryptValue.value.substr(0, 10) : '';
          return false;
        }

        if (getDecryptValue.type === VaultFieldDtoType.Password) {
          forDecryptFields[field.id + '_confirm'] = getDecryptValue.value;
        }

        forDecryptFields[field.id] = getDecryptValue.value;
      });

      this.createCloneData(decryptVault);
      this.setValueInGlobalVariable(this._vaultTemplateComponent.form.value);
      this.vault = decryptVault;
      this._vaultTemplateComponent.setValue(forDecryptFields);
      this.formModal.settings.waiting = false;

    }).catch(error => {
      let title: string;
      let description: string;
      this._translate.get('Vault decryption error').subscribe((val: string) => title = val);
      this._translate.get('Check the internet connection of your master device')
        .subscribe((val: string) => description = val);

      this.formModal.settings.waiting = false;

      swal(title, description, 'error');
      console.log(error);
    });
  }

  /**
   * Create fields for UI form
   */
  public initModalFields (fields: any[]) {
    this.modalFields = Array<FieldConfig>();
    fields.forEach(data => {
      const type = this.types.find(res => data.type === res.type);
      const modalField = { type: type.field, placeholder: 'Enter', label: data.label, name: data.id, validation: [], value: data.value };
      if (data.type === VaultTemplateFieldDtoType.SingleDate) {
        modalField['inputType'] = 'date';
      }
      this.modalFields.push(modalField);
    });
    this._vaultTemplateComponent.reInit();
  }

  /**
   * Set values in global var from fields
   */
  private setValueInGlobalVariable (params: any) {
    const dirtyForm = this._vaultTemplateComponent.form.dirty;
    const validForm = this._vaultTemplateComponent.form.valid;
    this.formModal.methods[0].active = dirtyForm && validForm;
    Object.keys(params).forEach(key => {
      const found = this.fields.find(field => key === field.id);
      if (found) {
        found['value'] = params[key];
      }
    });
  }

  /**
   *  Change encryption status for vault
   */
  public changeEncryptionStatus (field: VaultTemplateFieldDto): void {
    field.encrypted = !field.encrypted;
  }

  /**
   *  Change quick copy state for vault
   */
  public changeQuickCopyState (field: VaultTemplateFieldDto): void {
    field.hasQuickCopy = !field.hasQuickCopy;
  }

  /**
   *  Delete field from vault
   */
  public deleteField (field: VaultTemplateFieldDto, fields: VaultTemplateFieldDto[], index: number): void {
    fields.splice(index, 1);
    this.initModalFields(fields);
  }

  /**
   * Detect method
   */
  private detectCallMethod () {
    if (this.editMode) {
      this.updateVault();
    } else {
      this.createVault();
    }
  }

  /**
   * Create new vault
   */
  private async createVault(): Promise<void> {
    let error: string;
    let title: string;
    let vault = new VaultDto();
    let vaultOwner = new UserDto();

    this.formModal.settings.waiting = true;
    this.formModal.methods[0].active = false;

    this._translate.get('Oops').subscribe((val: string) => title = val);
    this._translate.get('Enter Vault Level Name').subscribe((val: string) => error = val);

    /** Set vault properties */
    vaultOwner.id = this.user.id;
    vault.id = UUID.UUID();
    vault.name = this.formModal.settings.title;
    vault.fields = Array<VaultFieldDto>();

    this.fields.forEach((data, index) => {
      let field = new VaultFieldDto({
        id: UUID.UUID(),
        vaultId: vault.id,
        label: data.label,
        position: index,
        type: VaultFieldDtoType[String(data.type)],
        encrypted: data.encrypted,
        hasQuickCopy: data.hasQuickCopy,
      });
      vault.fields.push(field);
    });

    /** If vault level is exist */
    // if (this.vaultLevelId) {
    //     vault.vaultLevelId = this.vaultLevelId;
    // }

    /** Create new decrypted vault object */
    let decryptedVault = new EditableVault(vault);

    let symmKey = await this._secureStorageService.createNewSymmetryKey();
    let vaultKey = await this._clientVaultServiceClient.createVaultKey(vaultOwner.id, symmKey);
    vaultKey.vaultId = vault.id;
    decryptedVault.keys.push(vaultKey);

    /** Set values in the field */
    this.fields.forEach(data => {
      decryptedVault.GetDecryptedVaultField(data.label)
        .valueString = data.value ? data.type === VaultTemplateFieldDtoType.SingleDate ? new Date(data.value).toJSON() : data.value : '';
    });

    await this._clientVaultServiceClient.createVault(decryptedVault).catch(err => {
      swal({ type: 'error', title: 'Error', text: 'Vault didn\'t create' })
    });

    this.formModal.settings.waiting = false;
  }

  /**
   * Create clone vault data
   */
  private createCloneData (vault: EditableVault) {
    vault.decryptedFields.forEach(field => {
      this.defaultVaultSettings.push({
        id: field.id,
        label: field.label,
        position: field.position,
        type: field.type.toString(),
        value: field.value
      })
    });
  }

  /** In progress */
  private resetDate () {

  }

  /**
   * Update vault
   */
  private updateVault(): void {
    this.formModal.settings.waiting = true;
    this.formModal.methods[0].active = false;

    let vault = new VaultDto();
    vault.id = this.vault.id;
    vault.fields = Array<VaultFieldDto>();
    vault.name = this.formModal.settings.title;
    vault.vaultLevelId = this.vault.encryptedVault.vaultLevelId;

    this.fields.forEach((data, index) => {
      let field = new VaultFieldDto({
        id: data.id,
        vaultId: vault.id,
        label: data.label,
        position: index,
        type: VaultFieldDtoType[String(data.type)],
        encrypted: data.encrypted,
        hasQuickCopy: data.hasQuickCopy,
      });
      vault.fields.push(field);
    });

    const decryptedVault = new EditableVault(vault);

    this.fields.forEach(data => {
      if (data.type === VaultTemplateFieldDtoType.Tags) {
        decryptedVault.GetDecryptedVaultField(data.label).valueString = data.value.length ? data.value.join(' ') : '';
      } else {
        decryptedVault.GetDecryptedVaultField(data.label)
          .valueString = data.value ? data.type === VaultTemplateFieldDtoType.SingleDate ? new Date(data.value).toJSON() : data.value : '';
      }
    });
    decryptedVault.keys = this.vault.keys;
    decryptedVault.decrypted = true;

    this._clientVaultServiceClient.updateVault(decryptedVault.id, decryptedVault).then(data => {
      // this._cacheService.addVaultToCache(this.vault);
      this.formModal.settings.waiting = false;
    }).catch(data => {
      let title: string;
      let error: string;
      this._translate.get('Oops').subscribe((val: string) => title = val);
      this._translate.get('Enter Vault Level Name').subscribe((val: string) => error = val);
      swal(title, error, 'error');
      this.formModal.settings.waiting = false;
    });
  }
}