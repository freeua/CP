import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { IModalSettings, ModalSettings, ModalSize, SettingsService } from '@4tecture/ui-controls';
import {
  GroupDto, VaultDto, VaultLevelDto, VaultLevelPermissionDto, VaultLevelPermissionDtoPermission,
  VaultLevelPermissionSetDto, VaultPermissionDto,
  VaultPermissionDtoPermission, VaultPermissionSetDto
} from '@copassword/copassword.clients.secretmanagement';
import { UserDto } from '@copassword/copassword.clients.usermanagement';
import { ClientVaultService } from '../../services/client-vault.service';
import { TranslateService } from 'ng2-translate/ng2-translate';

declare const swal: any;

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html'
})

export class PermissionsComponent implements OnInit {

  public permissionsList = Array<{name: string, type: string, permission: string, id: string, waiting: boolean, itemId: string, inherited: boolean}>();
  public availablePermissionsList = Array<{name: string, status: string, type: string, object: any}>();
  public selectedPermissionToAdd: {name: string, status: string, type: string, object: any};
  public vaultPermissions: VaultPermissionSetDto;
  public permissionsModal: IModalSettings;
  @Input() groups = Array<GroupDto>();
  @Input() users = Array<UserDto>();
  public permissionTypeMode: string;
  public vaultLevelPermissions: any;
  public vaultLevel: VaultLevelDto;
  public permissionLoading = true;
  public vault: VaultDto;
  public enabled = false;
  public user: UserDto;

  constructor (
    private readonly _clientVaultService: ClientVaultService,
    private readonly _settingsService: SettingsService,
    private readonly _translate: TranslateService,
    private readonly _renderer: Renderer2
  ) { }

  public ngOnInit () {
    this.permissionsModal = new ModalSettings({
      size: ModalSize.large
    });

    this._settingsService.event.subscribe(data => {
      if (data.event === 'close') {
        if (data.data.id === this.permissionsModal.id) {
          this.vault = null;
          this.vaultLevel = null;
        }
      }
    });
  }

  public permissionModal () {
    this.createAvailablePermissionsList();
  }

  /**
   * Select permission for add
   */
  public selectPermissionForAdd (data: any) {
    if (data.status === 'selected') {
      this.selectedPermissionToAdd.status = 'clear';
      this.enabled = false;
    } else {
      if (data.status === 'clear') {
        if (this.selectedPermissionToAdd) {
          this.selectedPermissionToAdd.status = 'clear';
          this.enabled = false;
        }
        this.selectedPermissionToAdd = data;
        this.selectedPermissionToAdd.status = 'selected';
      }
      if (this.selectedPermissionToAdd) {
        this.enabled = true;
      }
    }
  }

  /**
   * Detect vault or vault level
   */
  public addPermission (permission: any) {
    if (this.permissionTypeMode === 'vault' || this.permissionTypeMode === 'levelVault') {
      this.createVaultPermission(this.selectedPermissionToAdd, permission);
    } else {
      this.createVaultLevelPermission(this.selectedPermissionToAdd, permission);
    }
  }

  /**
   * Detect vault or vault level
   */
  public updateSwitch (data: any, type: string) {
    /** If we to try update inherited then create a new permission */
    if (data.inherited) {
      const elem = this.availablePermissionsList.find(item => item.object.id === data.itemId);
      if (elem) {
        this.selectedPermissionToAdd = elem;
        this.addPermission(type);
      }
    } else {
      if (this.permissionTypeMode === 'vault' || this.permissionTypeMode === 'levelVault') {
        this.updateVaultPermission(data, type);
      } else {
        this.updateVaultLevelPermission(data, type);
      }
    }
  }

  /**
   * Detect vault or vault level
   */
  public deleteSwitch (item: any) {
    if (this.permissionTypeMode === 'vault' || this.permissionTypeMode === 'levelVault') {
      this.deleteVaultPermission(item);
    } else {
      this.deleteVaultLevelPermission(item);
    }
  }

  /**
   * Create modal for vault permission
   */
  public async openVaultPermissionsModal (vault: VaultDto, user: UserDto) {
    this.user = user;
    this.vault = vault;
    this.permissionTypeMode = 'vault';
    this.permissionLoading = true;
    this.permissionsModal.title = 'Vault permission (' + vault.name + ')';
    this.permissionsModal.showModal = true;
    this.permissionsList = Array();
    this.vaultPermissions = await this.getVaultPermission(vault.id);
    this.createAvailablePermissionsList();
    this.createNewList(this.vaultPermissions.vaultPermissions, this.vaultPermissions.inheritedVaultPermissions);
    this.permissionLoading = false;
  }

  /**
   * Create modal for vault level permission
   */
  public async openVaultLevelPermissionsModal (vaultLevel: VaultLevelDto, user: UserDto) {
    this.user = user;
    this.permissionTypeMode = 'vaultLevel';
    this.vaultLevel = vaultLevel;
    this.permissionLoading = true;
    this.permissionsModal.title = 'Vault level permission (' + vaultLevel.name + ')';
    this.permissionsModal.showModal = true;
    this.permissionsList = Array();
    this.vaultLevelPermissions = await this.getVaultLevelPermission(vaultLevel.id);
    this.createAvailablePermissionsList();
    this.createNewList(
      this.vaultLevelPermissions.vaultLevelPermissions,
      this.vaultLevelPermissions.inheritedVaultLevelPermissions
    );
    this.permissionLoading = false;
  }

  /**
   * Create modal for level level permission
   */
  public async openLevelVaultPermissionsModal (vaultLevel: VaultLevelDto, user: UserDto) {
    this.user = user;
    this.permissionTypeMode = 'levelVault';
    this.vaultLevel = vaultLevel;
    this.permissionLoading = true;
    this.permissionsModal.title = 'Vault permission for vault level (' + vaultLevel.name + ')';
    this.permissionsModal.showModal = true;
    this.permissionsList = Array();
    this.vaultPermissions = await this.getLevelVaultPermission(vaultLevel.id);
    this.createAvailablePermissionsList();
    this.createNewList(
      this.vaultPermissions.vaultPermissions,
      this.vaultPermissions.inheritedVaultPermissions
    );
    this.permissionLoading = false;
  }

  /**
   * Create permission list
   */
  private createNewList (permissions: any[], inherited: any[]) {
    const data = [...permissions, ...inherited];
    const checkInherited = permissions.length;
    this.permissionsList = Array();
    data.forEach((permission, index) => {
      if (permission.groupId) {
        permission.group = this.groups.find(group => group.id === permission.groupId);
        const permissionItem = {
          permission: permission.permission.toString(),
          inherited: index >= checkInherited,
          name: permission.group.name,
          itemId: permission.groupId,
          id: permission.id,
          waiting: false,
          type: 'group'
        };
        if (index >= checkInherited) {
          const findChild = permissions.find(data => data.groupId === permission.groupId);
          if (!findChild) {
            this.permissionsList.push(permissionItem);
          }
        } else {
          this.permissionsList.push(permissionItem);
        }
      }
      if (permission.userId) {
        permission.user = this.users.find(user => user.id === permission.userId);
        const permissionItem = {
          name: permission.user.firstName + ' ' + permission.user.lastName,
          permission: permission.permission.toString(),
          inherited: index >= checkInherited || this.user.id === permission.user.id,
          itemId: permission.userId,
          id: permission.id,
          waiting: false,
          type: 'user'
        };
        if (index >= checkInherited) {
          const findChild = permissions.find(data => data.userId === permission.userId);
          if (!findChild) {
            this.permissionsList.push(permissionItem);
          }
        } else {
          this.permissionsList.push(permissionItem);
        }
      }
    });
  }

  /**
   * Get vault level permissions
   */
  public getVaultPermission (id: string): Promise<VaultPermissionSetDto> {
    return this._clientVaultService.getVaultPermissionByVault(id);
  }

  /**
   * Set permission for vault
   */
  private createVaultPermission(data: any, permission: VaultPermissionDtoPermission): void {
    data.status = 'waiting';
    this.enabled = false;
    const vaultPermission: VaultPermissionDto = new VaultPermissionDto({
      permission: permission
    });

    if (this.permissionTypeMode === 'vault') {
      vaultPermission.vaultId = this.vault.id;
    }
    if (this.permissionTypeMode === 'levelVault') {
      vaultPermission.vaultLevelId = this.vaultLevel.id;
    }

    if (data.type === 'user') {
      vaultPermission.userId = data.object.id;
    }

    if (data.type === 'group') {
      vaultPermission.groupId = data.object.id;
    }

    this._clientVaultService.createVaultPermission(vaultPermission).then(data => {
      this.vaultPermissions.vaultPermissions.push(data);
      this.createNewList(this.vaultPermissions.vaultPermissions, this.vaultPermissions.inheritedVaultPermissions);
      this.availablePermissionList(this.vaultPermissions.vaultPermissions);
      delete this.selectedPermissionToAdd;
    }).catch(error => {
      console.warn(error);
      data.status = 'clear';
      swal({ type: 'error', title: 'Error', text: 'Permission didn\'t add' });
      delete this.selectedPermissionToAdd;
    });
  }

  /**
   * Update vault permission
   */
  private updateVaultPermission(data: any, permissionType: string) {
    let title: string;
    let error: string;
    data.waiting = true;
    const vaultPermission: VaultPermissionDto = new VaultPermissionDto({
      permission: VaultPermissionDtoPermission[permissionType]
    });

    if (this.permissionTypeMode === 'vault') {
      vaultPermission.vaultId = this.vault.id;
    }
    if (this.permissionTypeMode === 'levelVault') {
      vaultPermission.vaultLevelId = this.vaultLevel.id;
    }

    if (data.type === 'user') {
      vaultPermission.userId = data.itemId;
    }
    if (data.type === 'group') {
      vaultPermission.groupId = data.itemId;
    }

    this._translate.get('Oops').subscribe((val: string) => title = val);
    this._translate.get('Cannot update permission').subscribe((val: string) => error = val);

    this._clientVaultService.updateVaultPermission(data.id, vaultPermission).then(result => {
      data.permission = VaultPermissionDtoPermission[permissionType];
      data.waiting = false;
    }).catch(err => {
      swal(title, error, 'error');
      data.waiting = false;
      console.warn(err);
    });
  }

  /**
   * Delete vault permissions
   */
  public deleteVaultPermission(data: any): void {

    let title: string;
    let deleteBtn: string;
    let cancelBtn: string;
    this._translate.get('Are you sure ?').subscribe((val: string) => title = val);
    this._translate.get('Delete').subscribe((val: string) => deleteBtn = val);
    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);

    swal({
      title: title,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: deleteBtn,
      cancelButtonText: cancelBtn
    }).then((result) => {
      if (result.value) {
        data.waiting = true;
        this._clientVaultService.deleteVaultPermission(data.id).then(() => {
          const index = this.vaultPermissions.vaultPermissions.findIndex(vault => vault.id === data.id);
          this.vaultPermissions.vaultPermissions.splice(index, 1);
          this.createNewList(this.vaultPermissions.vaultPermissions, this.vaultPermissions.inheritedVaultPermissions);
          this.availablePermissionList(this.vaultPermissions.vaultPermissions);
        }).catch(error => {
          console.warn(error);
          data.waiting = false;
          swal({ type: 'error', title: 'Error', text: 'Permission didn\'t remove' });
        });
      }
    });
  }

  /**
   * Get vault level permissions
   */
  public getVaultLevelPermission (id: string): Promise<VaultLevelPermissionSetDto> {
    return this._clientVaultService.getVaultLevelPermissionByVaultLevel(id);
  }

  /**
   * Get level vault permissions
   */
  public getLevelVaultPermission (id: string): Promise<VaultLevelPermissionSetDto> {
    return this._clientVaultService.getLevelVaultPermissionByVaultLevel(id);
  }

  /**
   * Set vault level permission
   */
  public createVaultLevelPermission(data: any, permission: VaultLevelPermissionDtoPermission) {
    let title: string;
    let error: string;
    data.status = 'waiting';
    this.enabled = false;
    const vaultLevelPermission: VaultLevelPermissionDto = new VaultLevelPermissionDto({
      vaultLevelId: this.vaultLevel.id,
      permission: permission
    });
    this._translate.get('Oops').subscribe((val: string) => title = val);
    this._translate.get('Cannot add permission').subscribe((val: string) => error = val);

    if (data.type === 'user') {
      vaultLevelPermission.userId = data.object.id;
    }

    if (data.type === 'group') {
      vaultLevelPermission.groupId = data.object.id;
    }

    this._clientVaultService.createVaultLevelPermission(vaultLevelPermission).then(data => {
      this.vaultLevelPermissions.vaultLevelPermissions.push(data);
      this.createNewList(
        this.vaultLevelPermissions.vaultLevelPermissions,
        this.vaultLevelPermissions.inheritedVaultLevelPermissions
      );
      this.availablePermissionList(this.vaultLevelPermissions.vaultLevelPermissions);
      delete this.selectedPermissionToAdd;
    }).catch(err => {
      delete this.selectedPermissionToAdd;
      swal(title, error, 'error');
      data.status = 'clear';
      console.warn(err);
    });
  }

  /**
   * Update vault level permission
   */
  public async updateVaultLevelPermission(data: any, permissionType: string) {

    let title: string;
    let error: string;
    data.waiting = true;
    const vaultLevelPermission: VaultLevelPermissionDto = new VaultLevelPermissionDto({
      vaultLevelId: this.vaultLevel.id,
      permission: VaultLevelPermissionDtoPermission[permissionType]
    });

    if (data.type === 'user') {
      vaultLevelPermission.userId = data.itemId;
    }
    if (data.type === 'group') {
      vaultLevelPermission.groupId = data.itemId;
    }

    this._translate.get('Oops').subscribe((val: string) => title = val);
    this._translate.get('Cannot update permission').subscribe((val: string) => error = val);

    this._clientVaultService.updateVaultLevelPermission(data.id, vaultLevelPermission).then(result => {
      data.permission = VaultLevelPermissionDtoPermission[permissionType];
      data.waiting = false;
    }).catch(err => {
      swal(title, error, 'error');
      data['selected'] = 'clear';
      data.waiting = false;
      console.warn(err);
    });
  }

  /**
   * Delete vault level permission
   */
  public deleteVaultLevelPermission(data: any): void {

    let title: string;
    let deleteBtn: string;
    let cancelBtn: string;
    this._translate.get('Are you sure ?').subscribe((val: string) => title = val);
    this._translate.get('Delete').subscribe((val: string) => deleteBtn = val);
    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);

    swal({
      title: title,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: deleteBtn,
      cancelButtonText: cancelBtn
    }).then((result) => {
      if (result.value) {
        data.waiting = true;
        this._clientVaultService.deleteVaultLevelPermission(data.id).then(() => {
          const index = this.vaultLevelPermissions.vaultLevelPermissions.findIndex(level => level.id === data.id);
          this.vaultLevelPermissions.vaultLevelPermissions.splice(index, 1);
          this.createNewList(
            this.vaultLevelPermissions.vaultLevelPermissions,
            this.vaultLevelPermissions.inheritedVaultLevelPermissions
          );
          this.availablePermissionList(this.vaultLevelPermissions.vaultLevelPermissions);
        }).catch(error => {
          console.warn(error);
          data.waiting = false;
          swal({ type: 'error', title: 'Error', text: 'Permission didn\'t remove' });
        });
      }
    });
  }

  public availablePermissionList (permissions: any[]) {
    this.availablePermissionsList = Array();
    this.groups.forEach(group => {
      if (!group.isSubscriptionAdmin) {
        const findGroup = permissions.find(vaultPermission => group.id === vaultPermission.groupId);
        this.availablePermissionsList.push({
          status: findGroup ? 'member' : 'clear',
          name: group.name,
          object: group,
          type: 'group'
        });
      }
    });

    this.users.forEach(user => {
      if (this.user.id !== user.id) {
        const findUser = permissions.find(memberUser => user.id === memberUser.userId);
        this.availablePermissionsList.push({
          name: user.firstName + ' ' + user.lastName,
          status: findUser ? 'member' : 'clear',
          object: user,
          type: 'user'
        });
      }
    });
  }

  /**
   * Open permissions list
   */
  public createAvailablePermissionsList (): void {
    let permissions;
    if (this.permissionTypeMode === 'vaultLevel') {
      permissions = this.vaultLevelPermissions.vaultLevelPermissions;
    } else if (this.permissionTypeMode === 'levelVault') {
      permissions = this.vaultPermissions.vaultPermissions;
    } else {
      permissions = this.vaultPermissions.vaultPermissions;
    }

    this.availablePermissionList(permissions);
  }

  /**
   * Show / hide dropdown
   */
  public dropdownMode (elem: HTMLElement) {
    const parent = elem.parentElement;
    const checkClass = parent.className.indexOf('show');
    if (!~checkClass) {
      this._renderer.addClass(parent, 'show');
    } else {
      this._renderer.removeClass(parent, 'show');
    }
  }
}