import { Component, Input, OnInit } from '@angular/core';
import {
  ComponentInModal, IComponentInModal, IModalSettings, ITableActions, ITableSettings, ModalSettings
} from '@4tecture/ui-controls';
import {
  GroupDto, GroupToGroupMappingDto, SwaggerException,
  UserToGroupMappingDto
} from '@copassword/copassword.clients.secretmanagement';
import { GroupService } from '../../services/group.service';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

@Component({
  selector: 'app-members-group',
  templateUrl: './members-group.component.html'
})

export class MembersGroupComponent implements OnInit {
  public groupDataForTable = Array<{name: string, object: any, type: string}>();
  public removeMembersBind: Function = this.removeMembers.bind(this);
  public managedUsersMembersBind: Function = this.managedUsersMembers.bind(this);
  public managedGroupsMembersBind: Function = this.managedGroupsMembers.bind(this);
  public currentMembersModal: IModalSettings;
  public membersControlMethods: ITableActions[];
  public groupsControlMethods: ITableActions[];
  public usersControlMethods: ITableActions[];
  public groupsModal: IComponentInModal;
  public usersModal: IComponentInModal;
  @Input() groups = Array<GroupDto>();
  @Input() users = Array<UserDto>();
  public group: GroupDto;
  public membersTableSettings: ITableSettings = {
    params: [
      { property: 'name', title: 'Name' }
    ]
  };
  public groupsTableSettings: ITableSettings = {
    params: [
      { property: 'name', title: 'Name' }
    ]
  };
  public usersTableSettings: ITableSettings = {
    params: [
      { property: 'firstName', title: 'First Name' },
      { property: 'lastName', title: 'Last Name' }
    ]
  };

  constructor (
    private readonly _groupService: GroupService
  ) { }

  ngOnInit () {
    this.currentMembersModal = new ModalSettings({});
    this.membersControlMethods = [ { function: this.removeMembersBind,  icon: 'far fa-trash-alt' } ];
    this.groupsControlMethods = [{
      function: this.managedGroupsMembersBind,
      switchIcon: {
        from: 'selected',
        params: [
          { key: 'member', value: 'fas fa-check-circle' },
          { key: 'clear', value: 'fas fa-plus-circle' },
          { key: 'waiting', value: 'fas fa-spinner fa-spin' }
        ]
      }
    }];
    this.usersControlMethods = [{
      function: this.managedUsersMembersBind,
      switchIcon: {
        from: 'selected',
        params: [
          { key: 'member', value: 'fas fa-check-circle' },
          { key: 'clear', value: 'fas fa-plus-circle' },
          { key: 'waiting', value: 'fas fa-spinner fa-spin' }
        ]
      }
    }];

    this.usersModal = new ComponentInModal({
      methods: [],
      settings: new ModalSettings({
        title: 'Users'
      })
    });

    this.groupsModal = new ComponentInModal({
      methods: [],
      settings: new ModalSettings({
        title: 'Groups'
      })
    });
  }

  /**
   * Open modal and set value
   */
  public openModal (group: GroupDto): void {
    this.currentMembersModal.title = group.name;
    this.currentMembersModal.showModal = true;
    this.group = group;
    this.createMembersList();
  }

  /**
   * Create members list for table
   */
  private createMembersList (): void {
    this.groupDataForTable = Array();
    this.group.memberGroups.forEach(memberGroup => {
      this.groupDataForTable.push({
        name: memberGroup.memberGroupName,
        object: memberGroup,
        type: 'group'
      });
    });
    this.group.members.forEach(memberGroup => {
      this.groupDataForTable.push({
        name: memberGroup.userName,
        object: memberGroup,
        type: 'user'
      });
    });
  }

  /**
   * Remove member group or user
   */
  public removeMembers(member: any, members: any[], index: number): void {
    if (member.type === 'group') {
      this._groupService.deleteGroupToGroupMapping(member.object.memberGroupId, member.object.parentGroupId).then(() => {
        const i = this.group.memberGroups.findIndex(i => i.memberGroupId === member.object.memberGroupId);
        this.group.memberGroups.splice(i, 1);
        members.splice(index, 1);
      }).catch((error: SwaggerException) => {
        alert(error.response);
      });
    }
    if (member.type === 'user') {
      this._groupService.deleteUserToGroupMapping(member.object.userId, member.object.groupId).then(() => {
        const i = this.group.members.findIndex(i => i.userId === member.object.userId);
        this.group.members.splice(i, 1);
        members.splice(index, 1);
      }).catch((error: SwaggerException) => {
        alert(error.response);
      });
    }
  }

  /**
   * Open modal with full users list for add to members
   */
  public openUsersList (): void {
    this.assignSelectedValueForUsers();
    this.usersModal.settings.showModal = true;
  }

  /**
   * Open modal with full groups list for add to members
   */
  public openGroupsList (): void {
    this.assignSelectedValueForGroups();
    this.groupsModal.settings.showModal = true;
  }

  /**
   * Assign property selected for member groups
   */
  public assignSelectedValueForGroups (): void {
    this.groups.forEach(group => {
      const findGroup = this.group.memberGroups.find(memberGroup => group.id === memberGroup.memberGroupId);
      group['selected'] = findGroup ? 'member' : 'clear';
    });
  }

  /**
   * Assign property selected for member users
   */
  public assignSelectedValueForUsers (): void {
    this.users.forEach(user => {
      const findUser = this.group.members.find(memberUser => user.id === memberUser.userId);
      user['selected'] = findUser ? 'member' : 'clear';
    });
  }

  /**
   * Add user to members
   */
  public managedUsersMembers (user: UserDto): void {
    if (user['selected'] === 'clear') {
      user['selected'] = 'waiting';
      const mapping = new UserToGroupMappingDto({
        userId: user.id,
        groupId: this.group.id
      });

      this._groupService.mapUserToGroup(mapping).then((mappingUser: UserToGroupMappingDto) => {
        // mappingUser.user = user;
        user['selected'] = 'member';
        this.group.members.push(mappingUser);
        this.createMembersList();
      }).catch((error: SwaggerException) => {
        alert(error.response);
      });
    }
  }

  /**
   * Add group to members
   */
  public managedGroupsMembers (group: GroupDto): void {
    if (group['selected'] === 'clear') {
      group['selected'] = 'waiting';
      const mapping = new GroupToGroupMappingDto({
        parentGroupId: this.group.id,
        memberGroupId: group.id
      });

      this._groupService.mapMemberGroupToParentGroup(mapping).then((mappingGroup: GroupToGroupMappingDto) => {
        group['selected'] = 'member';
        this.group.memberGroups.push(mappingGroup);
        this.createMembersList();
      }).catch((error: SwaggerException) => {
        alert(error.response)
      });
    }
  }
}
