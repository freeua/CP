import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BlankComponent } from './components/common/layouts/blank.component';
import { BasicComponent } from './components/common/layouts/basic.component';
import { VaultsComponent } from './components/vaults/vaults.component';
import { GroupsComponent } from './components/groups/groups.component';
import { TemplatesComponent } from './components/templates/templates.component';
import { SigninOidcComponent } from './components/signin-oidc/signin-oidc.component';
import { AuthenticationGuard } from './AuthenticationGuard';
import { RegistrationComponent } from './components/registration/registration.component';

export const ROUTES: Routes = [
    { path: '', redirectTo: '/vaults', pathMatch: 'full'},
    { path: 'signin-oidc', component:  SigninOidcComponent},
    { path: 'signout-callback-oidc', redirectTo: '/vaults', pathMatch: 'full' },
    {
        path: '', component: BasicComponent,
        children: [
            { path: 'vaults', component: VaultsComponent, canActivate: [AuthenticationGuard] },
            { path: 'groups', component: GroupsComponent, canActivate: [AuthenticationGuard] },
            { path: 'templates', component: TemplatesComponent, canActivate: [AuthenticationGuard] }
        ]
    },
    {
        path: '', component: BlankComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'registration', component: RegistrationComponent }
        ]
    },

    { path: '**', redirectTo: '/vaults', pathMatch: 'full' }
];