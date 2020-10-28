import { Component, ViewChild } from '@angular/core';
import { SecureStorageService } from '../../services/secure-storage.service';
import { ClientVaultService } from '../../services/client-vault.service';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { UserDto } from '@copassword/copassword.clients.usermanagement';
import { UserService } from '../../services/user.service';
import { EditableVaultField } from '../../entities/editableVaultField';
import { ClipBoardService } from '../../services/clipboard.service';
import { EditableVault } from '../../entities/editableVault';
import { ActivatedRoute } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import {
  SecretManagementServiceClient, VaultDto, VaultFieldDto, VaultFieldDtoType, GroupDto,
  VaultTemplateDto, VaultLevelDto, VaultLevelDtoType
} from '@copassword/copassword.clients.secretmanagement';
import { VaultTemplatesComponent } from './vault-templates.component';
import { VaultManageComponent } from './vault-manage.component';
import { VaultService } from '../../services/vault.service';
import { PermissionsComponent } from './permissions.component';
import { GroupService } from '../../services/group.service';

declare let jQuery: any;
declare let swal: any;

@Component({
  selector: 'vaults',
  templateUrl: './vaults.component.html'
})

export class VaultsComponent {

  // Refactoring

  @ViewChild(VaultTemplatesComponent)
  private _vaultTemplateComponent: VaultTemplatesComponent;

  @ViewChild(VaultManageComponent)
  private _vaultManageComponent: VaultManageComponent;

  @ViewChild(PermissionsComponent)
  private _permissionsComponent: PermissionsComponent;

  // Refactoring end

  private vault: EditableVault;
  private currentNestingLevel: VaultLevelDto;
  public vaultLevelPermission: VaultLevelDto;
  public groups = Array<GroupDto>();
  public vaultPermission: VaultDto;
  public vaultLevel: VaultLevelDto;
  public disabled = {value: true};
  public selectTemplates = false;
  public users = Array<UserDto>();
  public storageState = false;
  public vaultTree: VaultDto;
  public awaiting = false;
  public vaultID: string;
  public visible = false;
  public user: UserDto;
  public cache: any;

  constructor(
    private readonly _groupService: GroupService,
    private readonly _clientVaultServiceClient: ClientVaultService,
    private readonly _secretManagementServiceClient: SecretManagementServiceClient,
    private readonly _secureStorageService: SecureStorageService,
    private readonly _userService: UserService,
    private readonly _clipBoardService: ClipBoardService,
    private readonly _dragulaService: DragulaService,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _translate: TranslateService,
    private readonly _vaultService: VaultService
  ) { }

  /**
   * OnInit
   * @return {void}
   */
  public async ngOnInit(): Promise<void> {

    this.user = await this._userService.getUserAccount();
    this.getVaultLevelTree().then(data => {
      this.vaultLevel = data;
    });
    this.fetchData();
  }

  public templateAction () {
    this._vaultTemplateComponent.openTemplatesModal();
  }

  /**
   * Get users and vaults
   */
  public async fetchData(): Promise<void> {
    this.users = await this._userService.getCurrentSubscriptionUsers();
    this.groups = await this._groupService.getCurrentSubscriptionGroups();
  }

  /**
   * Select vault and open popup
   */
  public selectVault(data: Object): void {
    const editableVault = new EditableVault(data['vault']);

    let title: string;
    let description: string;

    this._translate.get('Vault decryption error').subscribe((val: string) => title = val);
    this._translate.get('Check the internet connection of your master device')
      .subscribe((val: string) => description = val);

    this.vault = editableVault;
    this.vaultTree = data['vault'];
    this.vaultTree['decrypt'] = false;
    this.vaultTree['decrypting'] = true;

    this._vaultService.checkDecryptedVault(editableVault)
      .then(vault => {
        this.awaiting = false;
        this.vault = vault;
        this.vaultTree['decrypt'] = true;
        this.vaultTree['decrypting'] = false;
      })
      .catch(error => {
        this.awaiting = false;
        this.vaultTree['decrypting'] = false;
        swal(title, description, 'error');
      });

    this.visible = true;
    this.vault.name = data['vault']['name'];
    this.vaultID = data['vault']['id'];
    this.storageState = true;
  }

  /**
   * Background decrypting
   */
  private backgroundDecryptVault(vault: VaultDto): void {
    const editableVault = new EditableVault(vault);
    let title: string;
    let description: string;

    this._translate.get('Vault decryption error').subscribe((val: string) => title = val);
    this._translate.get('Check the internet connection of your master device')
      .subscribe((val: string) => description = val);

    vault['decrypt'] = false;
    vault['decrypting'] = true;

    this.vaultTree = vault;

    this._vaultService.checkDecryptedVault(editableVault)
      .then(data => {
        this.awaiting = false;
        vault['decrypt'] = true;
        vault['decrypting'] = false;
      })
      .catch(error => {
        this.awaiting = false;
        swal(title, description, 'error');
        vault['decrypting'] = false;
      });
  }

  /**
   * Set new vault params
   */
  public setVaultParams(template?: VaultTemplateDto): void {

    this.selectTemplates = false;
    this.vault = new EditableVault(new VaultDto());

    this.visible = true;
    this.storageState = false;
    this.vault.name = template.name;
    this.vault.decryptedFields = Array<EditableVaultField>();

    if (template) {
      template.vaultTemplateFields.forEach(data => {
        let field = new VaultFieldDto();
        field.encrypted = false;
        field.hasQuickCopy = false;
        field.encrypted = data.encrypted;
        field.label = data.label;
        field.position = data.position;
        field.type = VaultFieldDtoType[String(data.type)];
        let obj = new EditableVaultField(field);
        this.vault.decryptedFields.push(obj);
      });
    }
  }

  /**
   * Add Vault Level
   */
  public async addVaultLevel(data: Object): Promise<void> {

    let confirmBtn: string;
    let title: string;
    let cancelBtn: string;
    let placeholder: string;

    this._translate.get('Enter Vault Level Name').subscribe((val: string) => title = val);
    this._translate.get('Enter name').subscribe((val: string) => placeholder = val);
    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);
    this._translate.get('Ok').subscribe((val: string) => confirmBtn = val);

    const {value: name} = await swal({
      title: title,
      input: 'text',
      inputPlaceholder: placeholder,
      showCancelButton: true,
      inputValidator: (value) => {
        return !value && 'You need to write level name!'
      }
    });

    if (name) {
      const createVaultLevel = new VaultLevelDto({
        name: name,
        position: 0,
        isFavourite: false,
        type: VaultLevelDtoType.UserRoot,
        parentLevelId: data['levelVault']['id'],
        subscriptionId: this.user.subscriptionId,
      });

      this._clientVaultServiceClient.addVaultLevel(createVaultLevel).then(vaultLevel => {
        data['levelVault']['childLevels'].push(vaultLevel);
      });
    }
  }

  /**
   * Get vault levels
   */
  public getVaultLevelTree(): Promise<VaultLevelDto> {
    return this._secretManagementServiceClient.getVaultLevelTree(this.user.subscriptionId, this.user.id).toPromise();
  }

  /**
   * Get vault levels
   */
  public updateVaultLevel(id: number, vaultLevel: VaultLevelDto): void {
    let title: string;
    let error: string;

    this._translate.get('Oops').subscribe((val: string) => title = val);
    this._translate.get('Enter Vault Level Name').subscribe((val: string) => error = val);

    this._clientVaultServiceClient.updateVaultLevel(id, vaultLevel)
      .catch(err => {
        swal(title, error, 'error');
        console.warn('Error');
    });
  }

  /**
   * Delete vault level
   */
  public deleteVaultLevel(data: Object): void {

    let title: string;
    let message: string;
    let deleteBtn: string;
    let cancelBtn: string;

    this._translate.get('Are you sure ?').subscribe((val: string) => title = val);
    this._translate.get('Vault level will not be available!').subscribe((val: string) => message = val);
    this._translate.get('Delete').subscribe((val: string) => deleteBtn = val);
    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);

    swal({
      title: title,
      text: message,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: deleteBtn,
      cancelButtonText: cancelBtn,
    }).then((result) => {
      if (result.value) {
        const index = data['dataVaults'].indexOf(data['levelVault']);
        this._clientVaultServiceClient.deleteVaultLevel(data['levelVault']['id']).then(() => {
          data['dataVaults'].splice(index, 1);
        });
      }
    })
  }

  /**
   * Delete vault
   */
  public deleteVault(data: Object): void {

    let text: string;
    let title: string;
    let deleteBtn: string;
    let cancelBtn: string;

    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);
    this._translate.get('Delete').subscribe((val: string) => deleteBtn = val);
    this._translate.get('Are you sure ?').subscribe((val: string) => title = val);
    this._translate.get('You will not be able to recover this vault!').subscribe((val: string) => text = val);

    const editableVault = new EditableVault(data['vault']);
    this.currentNestingLevel = data['child'];

    swal({
      title: title,
      text: text,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: deleteBtn,
      cancelButtonText: cancelBtn
    }).then((data) => {
      if (data.hasOwnProperty('value')) {
        this._clientVaultServiceClient.deleteVault(editableVault).then(vault => {
          const index = this.currentNestingLevel.vaults.indexOf(data['vault']);
          this.currentNestingLevel.vaults.splice(index, 1);
        });
      }
    });
  }

  public openVaultModalForCreate (template: VaultTemplateDto) {
    this._vaultManageComponent.openVaultModalForCreate(template);
  }

  public openVaultModalForUpdate (data: any) {
    this._vaultManageComponent.openVaultModalForUpdate(data);
  }

  /**
   * Select vault permission
   */
  public selectVaultPermission(vault: VaultDto): void {
    this._permissionsComponent.openVaultPermissionsModal(vault, this.user);
  }

  /**
   * Select vault permission
   */
  public selectVaultLevelPermission(vaultLevel: VaultLevelDto): void {
    this._permissionsComponent.openVaultLevelPermissionsModal(vaultLevel, this.user);
  }

  /**
   * Select vault permission
   */
  public selectLevelVaultPermission(vaultLevel: VaultLevelDto): void {
    this._permissionsComponent.openLevelVaultPermissionsModal(vaultLevel, this.user);
  }

  public collapse(event: any) {
    jQuery(event).toggleClass('dd-collapsed');
  }

}
