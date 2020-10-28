import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { OAuthService } from './services/oauth.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {}

  canActivate() {
    const hasIdToken = this.oauthService.hasValidIdToken();
    const hasAccessToken = this.oauthService.hasValidAccessToken();

    if (hasIdToken && hasAccessToken) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
