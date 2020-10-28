import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TemplatesService } from '../../services/templates.service';
import {
  VaultTemplateDto, VaultTemplateFieldDto, VaultTemplateFieldDtoType, VaultTemplateDtoTemplateType
} from '@copassword/copassword.clients.secretmanagement';
import { UserService} from '../../services/user.service';
import { UserDto } from '@copassword/copassword.clients.usermanagement';
import {
  ComponentInModal, IComponentInModal, IModalActions, IModalSettings, ITableActions, ITableSettings, ModalActions,
  ModalButtonPosition, ModalButtonType, ModalSettings, SettingsService
} from '@4tecture/ui-controls';

declare const swal: any;

@Component({
  selector: 'app-vault-templates',
  templateUrl: './vault-templates.component.html',
})

export class VaultTemplatesComponent implements OnInit {

  @Input() user: UserDto;
  @Input() onlyShow = true;
  @Output() createVaultEmit = new EventEmitter<any>();
  public templates: VaultTemplateDto[];
  public changeEncryptionStatusBind: Function = this.changeEncryptionStatus.bind(this);
  public changeQuickCopyStateBind: Function = this.changeQuickCopyState.bind(this);
  public initVaultObjectBind: Function = this.initVaultObject.bind(this);
  public deleteFieldBind: Function = this.deleteField.bind(this);
  public addNewFieldBind: Function = this.addNewField.bind(this);
  public createVaultBind: Function = this.createVault.bind(this);
  public vaultTemplateModalSettings: IComponentInModal;
  public vaultListModalActions: IModalActions[];
  public vaultTemplateSettings: ITableSettings;
  public vaultControlMethods: ITableActions[];
  public vaultListModal: IModalSettings;
  public templateFields = Array<any>();
  public template: VaultTemplateDto;
  public option: boolean;
  public loading = true;
  public amountSharedTemplates = 0;
  public amountSystemTemplates = 0;

  constructor(
    private readonly _templatesService: TemplatesService,
    private readonly _userService: UserService,
    private readonly _settingsService: SettingsService
  ) { }

  ngOnInit() {

    /** UI table options for vault template */
    this.vaultTemplateSettings = {
      params: [
        { property: 'label', title: 'Label', edit: true },
        { property: 'type', title: 'Type', edit: false },
      ],
      dragName: 'vaultTemplate'
    };

    /** UI modal settings for vaultTemplateSettings */
    this.vaultTemplateModalSettings = new ComponentInModal({
      methods: [
        new ModalActions({
          description: 'Add',
          type: ModalButtonType.select,
          position: ModalButtonPosition.left,
          function: this.addNewFieldBind,
          selectData: [
            { name: 'Single Line Text', value: VaultTemplateFieldDtoType.SingleLineText },
            { name: 'Multi Line Text', value: VaultTemplateFieldDtoType.MultiLineText },
            { name: 'Icon', value: VaultTemplateFieldDtoType.Icon },
            { name: 'Email', value: VaultTemplateFieldDtoType.Email },
            { name: 'Password', value: VaultTemplateFieldDtoType.Password },
            { name: 'Url', value: VaultTemplateFieldDtoType.Url },
            { name: 'Single Date', value: VaultTemplateFieldDtoType.SingleDate },
            { name: 'Expiration Date', value: VaultTemplateFieldDtoType.ExpirationDate },
            { name: 'Tags', value: VaultTemplateFieldDtoType.Tags },
          ]
        }),
        new ModalActions({ description: 'Create', function: this.initVaultObjectBind, functionParams: [this.option] })
      ],
      settings: new ModalSettings({
        showModal: false,
        editMode: true
      })
    });

    /** Control methods for vault fields*/
    this.vaultControlMethods = [
      {
        function: this.changeQuickCopyStateBind,
        switchIcon: {
          from: 'hasQuickCopy',
          params: [ { key: true, value: 'far fa-square' }, { key: false, value: 'far fa-check-square' } ]
        }
      },
      {
        function: this.changeEncryptionStatusBind,
        switchIcon: {
          from: 'encrypted',
          params: [ { key: true, value: 'fas fa-unlock' }, { key: false, value: 'fas fa-lock' } ]
        }
      },
      { function: this.deleteFieldBind, icon: 'far fa-trash-alt' }
    ];

    /** UI Modal for templates */
    this.vaultListModal = new ModalSettings({
      title: 'Select a vault template',
    });

    /** UI Modal actions for templates modal */
    this.vaultListModalActions = [
      new ModalActions({
        description: 'Create vault',
        function: this.createVaultBind,
        active: false
      })
    ];

    /** UI any events */
    this._settingsService.event.subscribe(res => {
      /** Actions then closed templates modal */
      if (this.vaultListModal.id === res.data.id) {
        this.vaultListModalActions[0].active = false;
        this.templateFields = null;
        this.template = null;
      }
    });

    this.getTemplates();
  }

  /**
   * Count shared and system templates
   */
  private countTemplates () {
    let system = 0;
    let shared = 0;
    this.templates.forEach(template => {
      if (template.templateType === VaultTemplateDtoTemplateType.Shared) {
        shared += 1;
      }
      if (template.templateType === VaultTemplateDtoTemplateType.System) {
        system += 1;
      }
    });

    this.amountSharedTemplates = shared;
    this.amountSystemTemplates = system;
  }

  /**
   * Show templates modal
   */
  public openTemplatesModal (): void {
    this.vaultListModal.showModal = true;
  }

  /**
   * Open modal for edit vault fields
   */
  public openVaultTemplateModal (option: boolean): void {
    /** Set params for modal */
    this.option = option;
    this.templateFields = Object.assign([], this.template.vaultTemplateFields);
    this.vaultTemplateModalSettings.settings.showModal = true;
    this.vaultTemplateModalSettings.settings.title = this.template.name;
    this.vaultTemplateModalSettings.settings.description = this.template.description;
    this.vaultTemplateModalSettings.methods[1].description = option ? 'Create' : 'Update';
  }

  /**
   *  Add new field in vault
   */
  public addNewField (field: string): void {
    const newField = new VaultTemplateFieldDto({
      position: this.templateFields.length + 1,
      type: VaultTemplateFieldDtoType[field],
      hasQuickCopy: true,
      encrypted: true,
      label: field
    });

    this.templateFields.push(newField);
  }

  /**
   *  Change encryption status
   */
  public changeEncryptionStatus (field: VaultTemplateFieldDto): void {
    field.encrypted = !field.encrypted;
  }

  /**
   *  Change quick copy state
   */
  public changeQuickCopyState (field: VaultTemplateFieldDto): void {
    field.hasQuickCopy = !field.hasQuickCopy;
  }

  /**
   *  Delete field
   */
  public deleteField (field: VaultTemplateFieldDto, fields: VaultTemplateFieldDto[], index: number): void {
    fields.splice(index, 1);
  }

  public createVault () {
    this.createVaultEmit.emit(this.template);
  }

  /**
   * Get templates
   */
  private async getTemplates(): Promise<void> {
    this.template = null;
    this.templates = await this._templatesService.getTemplates();
    this.countTemplates();
    this.loading = false;
  }

  /**
   * Select template
   */
  public selectTemplate(template: VaultTemplateDto): void {
    this.template = template;
    if (this.template) {
      this.vaultListModalActions[0].active = true;
    }
  }

  /**
   * Create new object
   */
  public initVaultObject (): void {
    const template = new VaultTemplateDto({
      description: this.vaultTemplateModalSettings.settings.description,
      name: this.vaultTemplateModalSettings.settings.title,
      vaultTemplateFields: Array<VaultTemplateFieldDto>(),
      templateType: VaultTemplateDtoTemplateType.Shared,
      subscriptionId: this.user.subscriptionId,
      icon: this.template.icon,
      creatorId: this.user.id
    });

    if (this.option) {
      this.templateFields.forEach(data => {
        delete data.id;
        data.vaultTemplateId = template.id;
        template.vaultTemplateFields.push(data);
      });
      this.createVaultTemplate(template);
    } else {
      template.id = this.template.id;
      template.vaultTemplateFields = this.templateFields;
      this.updateVaultTemplate(template);
    }
  }

  /**
   * Create template
   */
  private createVaultTemplate(template: VaultTemplateDto): void {
    this.vaultTemplateModalSettings.settings.waiting = true;
    this.vaultTemplateModalSettings.settings.waitingDescription = 'Creating template ...';
    this._templatesService.postTemplate(template).then(() => {
      this.templates.push(template);
      this.vaultTemplateModalSettings.settings.waiting = false;
      this.countTemplates();
    }).catch(error => {
      swal({ type: 'error', title: 'Error', text: 'Template didn\'t create' });
      this.vaultTemplateModalSettings.settings.waiting = false;
    });
  }

  /**
   * Update template
   */
  private updateVaultTemplate(template: VaultTemplateDto): void {
    this.vaultTemplateModalSettings.settings.waiting = true;
    this.vaultTemplateModalSettings.settings.waitingDescription = 'Updating template ...';
    this._templatesService.putTemplate(template.id, template).then(data => {
      this.template = template;
      this.vaultTemplateModalSettings.settings.waiting = false;
    }).catch(error => {
      swal({ type: 'error', title: 'Error', text: 'Template didn\'t update' });
      this.vaultTemplateModalSettings.settings.waiting = false;
    });
  }
  /**
   * Delete template
   */
  public deleteVaultTemplate(template: VaultTemplateDto): void {
    const index = this.templates.indexOf(template);
    this._templatesService.deleteTemplate(template.id).then(() => {
      this.templates.splice(index, 1);
      this.countTemplates();
    }).catch(() => {
      swal({ type: 'error', title: 'Error', text: 'Template didn\'t remove' });
    });
  }
}
