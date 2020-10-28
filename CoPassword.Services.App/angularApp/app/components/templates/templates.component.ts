import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
})

export class TemplatesComponent {

  public user: UserDto;

  constructor(
    private readonly _userService: UserService,
  ) { }

  public async ngOnInit(): Promise<void> {
    this.user = await this._userService.getUserAccount();
  }
}
