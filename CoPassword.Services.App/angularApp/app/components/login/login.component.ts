import { Component } from '@angular/core';
import { OAuthService } from '../../services/oauth.service';

@Component({
    selector: 'app-login',
    templateUrl: 'login.template.html'
})
export class LoginComponent {

    constructor (
        private oAuthService: OAuthService,
    ) { }

  /**
   * Login method
   */
    public login(e) {
        e.preventDefault();
        this.oAuthService.initImplicitFlow();
    }

}
