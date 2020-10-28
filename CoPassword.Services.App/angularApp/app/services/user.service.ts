import { Injectable } from '@angular/core';
import { OAuthService } from './oauth.service';
import { UserManagementServiceClient, UserDto } from '@copassword/copassword.clients.usermanagement';


export interface IUserService {
  getUserAccount(): Promise<UserDto>;

  getCurrentSubscriptionUsers(): Promise<UserDto[]>;
}

@Injectable()
export class UserService implements IUserService {

  private currentUser: UserDto;

  constructor(
    private readonly _oauthService: OAuthService,
    private readonly _userManagementClient: UserManagementServiceClient
  ) {}

  /**
   * Get current user
   */
  public async getUserAccount(): Promise<UserDto> {
    if (this._oauthService.hasValidAccessToken() && this._oauthService.hasValidIdToken()) {
      if (this.currentUser == null) {
        let user = await this._userManagementClient.getCurrentAuthenticatedUser().toPromise();
        if (user !== null) {
          this.currentUser = user;
        }
      }
    } else {
      this.currentUser = null;
    }

    return this.currentUser;
  }

  /**
   * Get current subscription users
   */
  public async getCurrentSubscriptionUsers(): Promise<UserDto[]> {
    let subscription = (await this.getUserAccount()).subscriptionId;
    return await this._userManagementClient.getUsersBySubscriptionId(subscription).toPromise();
  }
}

