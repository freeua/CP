import { Injectable } from '@angular/core';
import { OAuthService } from './oauth.service';
import { UserService } from '../services/user.service';
import {
    SecretManagementServiceClient, GroupDto, GroupToGroupMappingDto, UserToGroupMappingDto, SwaggerException
} from '@copassword/copassword.clients.secretmanagement';

@Injectable()
export class GroupService {

    constructor(
        private readonly _oAuthService: OAuthService,
        private readonly _userService: UserService,
        private readonly _secretManagementClient: SecretManagementServiceClient
    ) { }

  /**
   * Get group by id
   */
    public async getGroupById(groupId: number): Promise<GroupDto> {
        let group = await this._secretManagementClient.getGroup(String(groupId)).toPromise();

        return group;
    }

  /**
   * Get current subscription groups
   */
    public async getCurrentSubscriptionGroups(): Promise<GroupDto[]> {
        let subscription = (await this._userService.getUserAccount()).subscriptionId;
        let groups = await this._secretManagementClient.getGroupslBySubscriptionId(subscription).toPromise();

        return groups;
    }

  /**
   * Create group
   */
    public async createGroup(group: GroupDto): Promise<GroupDto> {
        let result = await this._secretManagementClient.createGroup(group).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });

        return result;
    }

  /**
   * Update group
   */
  public async updateGroup(group: GroupDto): Promise<GroupDto> {
        let result = await this._secretManagementClient.updateGroup(group.id, group).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });

        return result;
    }

  /**
   * Delete group
   */
    public async deleteGroup(id: string): Promise<void> {
        await this._secretManagementClient.deleteGroup(id).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });
    }

  /**
   * Add group to parent group
   */
    public async mapMemberGroupToParentGroup(mapping: GroupToGroupMappingDto): Promise<GroupToGroupMappingDto> {
        let result = await this._secretManagementClient.mapMemberGroupToParentGroup(mapping).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });

        return result;
    }

  /**
   * Add user to parent group
   */
    public async mapUserToGroup(mapping: UserToGroupMappingDto): Promise<UserToGroupMappingDto> {
        let result = await this._secretManagementClient.mapUserToGroup(mapping).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });

        return result;
    }

  /**
   * Delete group from parent group
   */
    public async deleteGroupToGroupMapping(memberGroupId: number, parentGroupId): Promise<void> {
        await this._secretManagementClient.deleteGroupToGroupMapping(String(memberGroupId), parentGroupId).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });
    }

  /**
   * Delete user from parent group
   */
    public async deleteUserToGroupMapping(userId: string, parentGroupId): Promise<void> {
        await this._secretManagementClient.deleteUserToGroupMapping(userId, parentGroupId).toPromise()
            .catch((error: SwaggerException) => {
                console.log(error);
                throw error;
            });
    }

}

