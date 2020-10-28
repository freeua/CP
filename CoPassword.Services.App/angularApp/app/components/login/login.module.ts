import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoginComponent } from './login.component';
import { RouterModule } from '@angular/router';
import { Http } from '@angular/http';
import { createTranslateLoader } from '../../services/settings.service';
import { TranslateLoader, TranslateModule } from 'ng2-translate/ng2-translate';

@NgModule({
    declarations: [LoginComponent],
    imports: [
        BrowserModule,
        RouterModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [Http]
        })
    ],
})

export class LoginModule { }
