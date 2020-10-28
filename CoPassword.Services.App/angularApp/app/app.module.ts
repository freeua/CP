import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './components/app/app.component'
import { VaultsComponent } from './components/vaults/vaults.component';
import { GroupsComponent } from './components/groups/groups.component';
import { AuthenticationGuard } from './AuthenticationGuard';
import {
  SettingsService, secretManagementServiceClient, pkiServiceClient,
  userManagementServiceClient, createTranslateLoader
} from './services/settings.service';
import { ClipBoardService } from './services/clipboard.service';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { NgxPaginationModule } from 'ngx-pagination';
import { ClientsBaseModule } from '@copassword/copassword.clients.base';
import {
  SecretManagementServiceClientModule,
  API_BASE_URL_SecretManagementServiceClient
} from '@copassword/copassword.clients.secretmanagement';
import { PkiServiceClientModule, API_BASE_URL_PkiServiceClient} from '@copassword/copassword.clients.pki';
import {
  UserManagementServiceClientModule,
  API_BASE_URL_UserManagementServiceClient
} from '@copassword/copassword.clients.usermanagement';
import { LoginModule } from './components/login/login.module';
import { RegistrationModule } from './components/registration/registration.module';
import { LayoutsModule } from './components/common/layouts/layouts.module';
import { FilterGroupPipe } from './pipes/filter-group.pipe';
import { FilterUsersPipe } from './pipes/filter-users.pipe';
import { ExistsFilterUsersPipe } from './pipes/exists-filter-users.pipe';
import { ExistsFilterGroupsPipe } from './pipes/exists-filter-groups.pipe';
import { ExistsGroupPermissionPipe } from './pipes/exists-group-permission.pipe';
import { ExistsUserPermissionPipe } from './pipes/exists-user-permission.pipe';
import { CacheControlService } from './services/cache-control.service';
import { VaultTemplatesComponent } from './components/vaults/vault-templates.component';
import { TemplatesService } from './services/templates.service';
import { SafePipe } from './pipes/safe.pipe';
import { TreeViewComponent } from './components/vaults/tree-view.component';
import { TranslateModule, TranslateLoader } from 'ng2-translate/ng2-translate';
import { OAuthService } from './services/oauth.service';
import { ROUTES } from './app.routes';
import { SigninOidcComponent } from './components/signin-oidc/signin-oidc.component';
import { UiControlsModule } from '@4tecture/ui-controls';
import { VaultManageComponent } from './components/vaults/vault-manage.component';
import { VaultService } from './services/vault.service';
import { ClientVaultService } from './services/client-vault.service';
import { PublicKeyService } from './services/public-key.service';
import { SecureStorageService } from './services/secure-storage.service';
import { UserService } from './services/user.service';
import { MembersGroupComponent } from './components/groups/members-group.component';
import { PermissionsComponent } from './components/vaults/permissions.component';
import { TemplatesComponent } from './components/templates/templates.component';
import { HttpClientModule } from '@angular/common/http';
import { FindPipe } from './pipes/find.pipe';
import { SortPipe } from './pipes/sort.pipe';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    VaultsComponent,
    GroupsComponent,
    FilterGroupPipe,
    FilterUsersPipe,
    SortPipe,
    ExistsFilterUsersPipe,
    ExistsFilterGroupsPipe,
    ExistsGroupPermissionPipe,
    ExistsUserPermissionPipe,
    SafePipe,
    VaultTemplatesComponent,
    FindPipe,
    TreeViewComponent,
    SigninOidcComponent,
    VaultManageComponent,
    MembersGroupComponent,
    PermissionsComponent,
    TemplatesComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ClientsBaseModule,
    SecretManagementServiceClientModule,
    PkiServiceClientModule,
    UserManagementServiceClientModule,
    LoginModule,
    RegistrationModule,
    DragulaModule,
    LayoutsModule,
    NgxPaginationModule,
    RouterModule.forRoot(ROUTES),
    UiControlsModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http]
    })
  ],
  providers: [
    ClipBoardService,
    CacheControlService,
    AuthenticationGuard,
    SettingsService,
    TemplatesService,
    DragulaService,
    OAuthService,
    VaultService,
    ClientVaultService,
    PublicKeyService,
    SecureStorageService,
    UserService,
    {
      provide: API_BASE_URL_SecretManagementServiceClient,
      useFactory: secretManagementServiceClient
    },
    {
      provide: API_BASE_URL_PkiServiceClient,
      useFactory: pkiServiceClient
    },
    {
      provide: API_BASE_URL_UserManagementServiceClient,
      useFactory: userManagementServiceClient
    }
  ]
})

export class AppModule { }
