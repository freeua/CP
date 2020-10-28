import { Component, OnInit } from '@angular/core';
import { ClientVaultService } from '../../services/client-vault.service';
import { PublicKeyService } from '../../services/public-key.service';
import { GroupService } from '../../services/group.service';
import { SecureStorageService } from '../../services/secure-storage.service';
import { UserService } from '../../services/user.service';
import { SettingsService } from '../../services/settings.service';

import { SecretManagementServiceClient } from '@copassword/copassword.clients.secretmanagement';
import { PkiServiceClient } from '@copassword/copassword.clients.pki';
import { UserManagementServiceClient } from '@copassword/copassword.clients.usermanagement';
import { ServiceClientConfiguration, AuthenticationOptions } from '@copassword/copassword.clients.base';
import { OAuthService } from '../../services/oauth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [ClientVaultService, PublicKeyService, SecureStorageService, UserService, GroupService, ServiceClientConfiguration]
})

export class AppComponent implements OnInit {

    public isLoad = false;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _oauthService: OAuthService
    ) {

        // URL of the SPA to redirect the user to after login
        this._oauthService.redirectUri = window.location.origin + '/signin-oidc';
        this._oauthService.postLogoutRedirectUri = window.location.origin + '/signout-callback-oidc';

        // The SPA's id. The SPA is registerd with this id at the auth-server
        this._oauthService.clientId = 'webclientapp';

        // set the scope for the permissions the client should request
        // The first three are defined by OIDC. The 4th is a usecase-specific one
        this._oauthService.scope = 'openid profile email';

        // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
        // OAuth2-based access_token
        this._oauthService.oidc = true;

        // resources
        this._oauthService.resource = 'PkiService UserManagementService SecretManagementService';

        // acr value
        this._oauthService.acr_values = 'tenant:copasswordpublic';

        // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
        // instead of localStorage
        this._oauthService.setStorage(sessionStorage);

        // The name of the auth-server that has to be mentioned within the token
        this._oauthService.issuer = this._settingsService.proAuthServiceUrl();

        // Set a dummy secret
        // Please note that the auth-server used here demand the client to transmit a client secret, although
        // the standard explicitly cites that the password flow can also be used without it. Using a client secret
        // does not make sense for a SPA that runs in the browser. That's why the property is called dummyClientSecret
        // Using such a dummy secreat is as safe as using no secret.
        this._oauthService.dummyClientSecret = 'client_secret';

        // Load Discovery Document and then try to login the user
        this._oauthService.loadDiscoveryDocument(this._settingsService.proAuthServiceUrl() + environment.openidConfig)
            .then(() => {

            // This method just tries to parse the token(s) within the url when
            // the auth-server redirects the user back to the web-app
            // It dosn't send the user the the login page
            this._oauthService.tryLogin({});

            let authOptions = new AuthenticationOptions();
            authOptions.setAccessToken(this._oauthService.getAccessToken());
            ServiceClientConfiguration.registerAuthOptions(SecretManagementServiceClient.name, authOptions);
            ServiceClientConfiguration.registerAuthOptions(PkiServiceClient.name, authOptions);
            ServiceClientConfiguration.registerAuthOptions(UserManagementServiceClient.name, authOptions);
            this.isLoad = true;
        });

    }

    ngOnInit () {

    }

}
