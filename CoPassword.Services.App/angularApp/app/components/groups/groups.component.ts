import { Component, ViewChild } from '@angular/core';
import { GroupDto, SwaggerException } from '@copassword/copassword.clients.secretmanagement';
import { UserDto } from '@copassword/copassword.clients.usermanagement';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ITableActions, ITableSettings } from '@4tecture/ui-controls';
import { MembersGroupComponent } from './members-group.component';

declare let swal: any;

@Component({
  selector: 'groups',
  templateUrl: './groups.component.html',
})

export class GroupsComponent {

  public deleteGroupBind: Function = this.deleteGroup.bind(this);
  public openModalBind: Function = this.openModal.bind(this);
  public tableControlMethods: ITableActions[];
  public editFormOptions: ITableSettings;
  @ViewChild(MembersGroupComponent)
  private _membersGroupComponent: MembersGroupComponent;
  public selectedGroup: GroupDto = null;
  public selectedMappingGroup: GroupDto = null;
  public selectedMappingUser: UserDto = null;
  public groups = Array<GroupDto>();
  public users = Array<UserDto>();
  public user: UserDto;
  public isLoad = false;
  public table: any[];
  public p = 1;

  constructor(
    private readonly _translate: TranslateService,
    private readonly _groupService: GroupService,
    private readonly _userService: UserService
  ) { }

  public async ngOnInit(): Promise<void> {

    /** Params for group list table */
    this.editFormOptions = {
      params: [
        { property: 'name', title: 'Group name' },
      ]
    };

    /** Actions for table list */
    this.tableControlMethods = [
      { function: this.openModalBind, icon: 'fa fa-eye' },
      { function: this.deleteGroupBind, icon: 'far fa-trash-alt' }
    ];

    this.user = await this._userService.getUserAccount();
    this.fetchGroups();
  }

  /**
   * Fetch data
   */
  public async fetchGroups(): Promise<void> {
    this.groups = await this._groupService.getCurrentSubscriptionGroups();
    this.users = await this._userService.getCurrentSubscriptionUsers();
    this.isLoad = true;
  }

  /**
   * Create new group
   */
  public addGroup(): void {
    let group = new GroupDto();
    let title: string;
    let errTitle: string;
    let msg: string;
    let confirmBtn: string;
    let cancelBtn: string;

    this._translate.get('Ok').subscribe((val: string) => confirmBtn = val);
    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);
    this._translate.get('Add group').subscribe((val: string) => title = val);
    this._translate.get('Group with that name already exists!').subscribe((val: string) => errTitle = val);
    this._translate.get('Please write another group name').subscribe((val: string) => msg = val);

    swal({
      title: title,
      input: 'text',
      showCancelButton: true,
      confirmButtonText: confirmBtn,
      cancelButtonText: cancelBtn,
      preConfirm: (data) => {
        if (data === '') {
          swal.showValidationError('Group name is required');
        }
      }
    }).then((result) => {
      if (result.value) {
        group.name = result.value;
        group.subscriptionId = this.user.subscriptionId;
        this._groupService.createGroup(group).then((result: any) => {
          this.fetchGroups();
        }).catch((error: SwaggerException) => {
          swal(errTitle, msg, 'error');
        });
      }
    });
  }

  /**
   * Delete group
   */
  public async deleteGroup(group: GroupDto, groups: GroupDto[], index: number): Promise<void> {
    let title: string;
    let msg: string;
    let deleteBtn: string;
    let cancelBtn: string;

    this._translate.get('Are you sure ?').subscribe((val: string) => title = val);
    this._translate.get('Delete').subscribe((val: string) => deleteBtn = val);
    this._translate.get('Cancel').subscribe((val: string) => cancelBtn = val);
    this._translate.get('You will not be able to recover this group with all its applied permissions!')
      .subscribe((val: string) => msg = val);

    swal({
      title: title,
      text: msg,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: deleteBtn,
      cancelButtonText: cancelBtn
    }).then((res) => {
      if (res.value) {
        this._groupService.deleteGroup(group.id).then(() => {
          groups.splice(index, 1);
        }).catch((error: SwaggerException) => {
          swal('Can\'t delete group!', 'Try again later', 'error');
        });
      }
    });
  }

  /**
   * Open members modal
   */
  private openModal (group: GroupDto) {
    this._membersGroupComponent.openModal(group);
  }
}
