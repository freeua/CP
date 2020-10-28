import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RegistrationComponent } from './registration.component';
import { RouterModule } from '@angular/router';
import { Http } from '@angular/http';
import { createTranslateLoader, reCaptchaKey } from '../../services/settings.service';
import { TranslateLoader, TranslateModule } from 'ng2-translate/ng2-translate';
import { SubscriptionComponent } from './steps/subscription/subscription.component';
import { FreeComponent } from './steps/free/free.component';
import { ProfessionalComponent } from './steps/professional/professional.component';
import { RegistrationService } from '../../services/registration.service';
import { UiControlsModule } from '@4tecture/ui-controls';
import { RECAPTCHA_SETTINGS, RecaptchaModule } from 'ng-recaptcha';
import { PaymentComponent } from './steps/payment/payment.component';
import { EmailVerifyComponent } from './steps/email-verify/email-verify.component';
import { CustomIdpComponent } from './steps/custom-idp/custom-idp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LicensingComponent } from './steps/licensing/licensing.component';
import { AccountComponent } from './steps/account/account.component';

@NgModule({
  declarations: [
    RegistrationComponent,
    SubscriptionComponent,
    FreeComponent,
    ProfessionalComponent,
    PaymentComponent,
    EmailVerifyComponent,
    CustomIdpComponent,
    LicensingComponent,
    AccountComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [ Http ]
    }),
    UiControlsModule,
    RecaptchaModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    RegistrationService,
    {
      provide: RECAPTCHA_SETTINGS,
      useFactory: reCaptchaKey
    },
  ],
  entryComponents: [
    SubscriptionComponent,
    ProfessionalComponent,
    EmailVerifyComponent,
    CustomIdpComponent,
    LicensingComponent,
    AccountComponent,
    PaymentComponent,
    FreeComponent,
  ]
})

export class RegistrationModule { }


