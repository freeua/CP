import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VaultLevelDto, VaultDto } from '@copassword/copassword.clients.secretmanagement';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

declare let jQuery: any;

@Component({
  selector: 'tree-view',
  templateUrl: './tree-view.component.html'
})

export class TreeViewComponent {

  @Input() data: VaultLevelDto[];
  @Input() user: UserDto;
  @Input() awaiting: boolean;
  @Input() queryParams: string;
  @Output() updateEmit = new EventEmitter<void>();
  @Output() copyFiledEmit = new EventEmitter<Object>();
  @Output() bgDecryptEmit = new EventEmitter<Object>();
  @Output() selectVaultEmit = new EventEmitter<Object>();
  @Output() deleteVaultEmit = new EventEmitter<Object>();
  @Output() addVaultLevelEmit = new EventEmitter<Object>();
  @Output() templateActionEmit = new EventEmitter<Object>();
  @Output() deleteVaultLevelEmit = new EventEmitter<Object>();
  @Output() selectVaultLevelEmit = new EventEmitter<VaultLevelDto>();
  @Output() selectVaultPermissionEmit = new EventEmitter<VaultDto>();
  @Output() setVaultLevelPermissionEmit = new EventEmitter<VaultLevelDto>();
  @Output() selectLevelVaultPermissionEmit = new EventEmitter<VaultLevelDto>();

  public addVaultLevel(data: Object) {
    this.addVaultLevelEmit.emit(data);
  }

  public deleteVaultLevel(data: Object) {
    this.deleteVaultLevelEmit.emit(data);
  }

  public deleteVault(data: Object) {
    this.deleteVaultEmit.emit(data);
  }

  public getVaultLevels() {
    this.updateEmit.emit();
  }

  public backgroundDecryptVault(vault: VaultDto) {
    this.bgDecryptEmit.emit(vault);
  }

  public selectVault(data: Object) {
    this.selectVaultEmit.emit(data);
  }

  public selectVaultPermission(vault: VaultDto) {
    this.selectVaultPermissionEmit.emit(vault)
  }

  public selectVaultLevelPermission(level: VaultLevelDto) {
    this.selectVaultLevelEmit.emit(level);
  }

  public templateAction(data: Object) {
    this.templateActionEmit.emit(data)
  }

  public setVaultLevelPermission(vaultLevel: VaultLevelDto) {
    this.setVaultLevelPermissionEmit.emit(vaultLevel);
  }

  public selectLevelVaultPermission(vaultLevel: VaultLevelDto) {
    this.selectLevelVaultPermissionEmit.emit(vaultLevel);
  }

  public collapse(event: any) {
    jQuery(event).toggleClass('hide-level');
  }

  public copy(data: Object) {
    this.copyFiledEmit.emit(data);
  }
}
