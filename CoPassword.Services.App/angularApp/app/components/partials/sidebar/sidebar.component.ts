import { Component, OnInit } from '@angular/core';
import { OAuthService } from '../../../services/oauth.service';
import { UserService } from '../../../services/user.service';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {

  public user: UserDto;

  constructor(
    private readonly oAuthService: OAuthService,
    private readonly _userService: UserService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.user = await this._userService.getUserAccount();
  }

  /**
   * Logout
   */
  public logout(): void {
    this.oAuthService.logOut();
  }

}
