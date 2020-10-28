import { Component, ComponentFactoryResolver, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { SubscriptionComponent } from './steps/subscription/subscription.component';
import { FreeComponent } from './steps/free/free.component';
import { ProfessionalComponent } from './steps/professional/professional.component';
import { RegistrationService } from '../../services/registration.service';
import { PaymentComponent } from './steps/payment/payment.component';
import { RegistrationDto } from '@copassword/copassword.clients.usermanagement';
import { LicensingComponent } from './steps/licensing/licensing.component';
import { AccountComponent } from './steps/account/account.component';
import { CustomIdpComponent } from './steps/custom-idp/custom-idp.component';
import { EmailVerifyComponent } from './steps/email-verify/email-verify.component';
import { OAuthService } from '../../services/oauth.service';

declare let swal: any;

@Component({
  selector: 'app-registration',
  templateUrl: 'registration.template.html'
})

export class RegistrationComponent implements OnInit {
  public step = 0;
  public currentFormValue;
  public storingData: any;
  public componentRef: any;
  public planList = Array();
  public captchaValue = false;
  public loadForm = true;
  @ViewChild('stepsContainer', { read: ViewContainerRef }) entry: ViewContainerRef;
  public steps = {
    free: {
      stack: [ SubscriptionComponent, LicensingComponent, FreeComponent, AccountComponent, EmailVerifyComponent ],
      steps: [
        { name: 'plan', selected: false, completed: false, icon: 'fas fa-file-alt', title: 'Plan' },
        { name: 'license', selected: false, completed: false, icon: 'fas fa-money-bill', title: 'Licensing' },
        { name: 'address', selected: false, completed: false, icon: 'fas fa-align-left', title: 'Address' },
        { name: 'account', selected: false, completed: false, icon: 'fas fa-user', title: 'Account' },
        { name: 'email', selected: false, completed: false, icon: 'fas fa-at', title: 'Email' }
      ]
    },
    paid: {
      stack: [ SubscriptionComponent, LicensingComponent, ProfessionalComponent, PaymentComponent, AccountComponent, EmailVerifyComponent ],
      steps: [
        { name: 'plan', selected: false, completed: false, icon: 'fas fa-file-alt', title: 'Plan' },
        { name: 'license', selected: false, completed: false, icon: 'fas fa-money-bill', title: 'Licensing' },
        { name: 'address', selected: false, completed: false, icon: 'fas fa-align-left', title: 'Address' },
        { name: 'payment', selected: false, completed: false, icon: 'fas fa-credit-card', title: 'Payment' },
        { name: 'account', selected: false, completed: false, icon: 'fas fa-user', title: 'Account' },
        { name: 'email', selected: false, completed: false, icon: 'fas fa-at', title: 'Email' }
      ]
    },
    custom: {
      stack: [ SubscriptionComponent, LicensingComponent, ProfessionalComponent, PaymentComponent, AccountComponent, CustomIdpComponent, EmailVerifyComponent ],
      steps: [
        { name: 'plan', selected: false, completed: false, icon: 'fas fa-file-alt', title: 'Plan' },
        { name: 'license', selected: false, completed: false, icon: 'fas fa-money-bill', title: 'Licensing' },
        { name: 'address', selected: false, completed: false, icon: 'fas fa-align-left', title: 'Address' },
        { name: 'payment', selected: false, completed: false, icon: 'fas fa-credit-card', title: 'Payment' },
        { name: 'account', selected: false, completed: false, icon: 'fas fa-user', title: 'Account' },
        { name: 'idps', selected: false, completed: false, icon: 'fas fa-cog', title: 'IDPs' },
        { name: 'email', selected: false, completed: false, icon: 'fas fa-at', title: 'Email' }
      ]
    }
  };

  constructor (
    private readonly _renderer: Renderer2,
    private readonly oAuthService: OAuthService,
    private readonly _resolver: ComponentFactoryResolver,
    public readonly _registrationService: RegistrationService,
  ) { }

  public async ngOnInit () {
    this.planList = this._registrationService.getPlans();
    this.storingData = { id: null, plan: 'free', dataPlan: null, payment: null, step: 0, forms: [] };
    const data = localStorage.getItem('registration_data');
    if (data) {
      const parseData = JSON.parse(data);
      this._registrationService.plan = parseData.plan;
      this.step = parseData.step;
      this.captchaValue = true;
      this.storingData.id = parseData.id;
      this.storingData.dataPlan = parseData.dataPlan;
      this._registrationService.disableReCaptcha = !!(this.storingData.id);
      this.storingData.forms = parseData.forms;
    }

    const countries = await this._registrationService.getCountryList();
    const plans = await this._registrationService.getPlansQuery();
    countries.forEach(country => {
      this._registrationService.countries[country['countryCode']] = country['nativeName']
    });
    plans.forEach(plan => {
      this._registrationService.plans.push({
        id: plan.id,
        name: plan.name,
        price: plan.planPrices[0].costPerUser,
        free: plan.planPrices[0].costPerUser === 0,
        type: plan.planPrices[0].costPerUser === 0 ? 'free' : 'paid',
        priceId: plan.planPrices[0].id,
      })
    });
    this.loadForm = false;
    this.createComponent();
  }

  /**
   * Create dynamic steps
   */
  public createComponent (): void {
    this.entry.clear();
    const stepName = this.steps[this._registrationService.plan].steps[this.step].name;
    const factory = this._resolver.resolveComponentFactory(this.steps[this._registrationService.plan].stack[this.step]);
    this.componentRef = this.entry.createComponent(factory);
    this._registrationService.disableNavigation = false;
    if (stepName === 'plan') {
      this.componentRef.instance.planList = this.planList;
      this.componentRef.instance.plan.subscribe(plan => {
        this._registrationService.plan = plan.type;
        this.storingData.dataPlan = plan;
        this.nextStep();
      });
    } else {
      this.componentRef.instance.step = this.step;
      this.componentRef.instance.plan = this.storingData.dataPlan;
      this.componentRef.instance.steps = this.steps;
      this.componentRef.instance.data = this.readStepData(stepName);
    }

    if (this.componentRef.instance.formData) {
      this.componentRef.instance.formData.subscribe(data => {
        this.currentFormValue = { stepName: stepName, values: data };
      });
    }

    if (this.componentRef.instance.recaptchaValue) {
      this.componentRef.instance.recaptchaValue.subscribe(data => {
        localStorage.setItem('recaptcha', data);
        this._registrationService.reCaptchaValue = data;
        this.captchaValue = !!data;
      })
    }

    if (this.componentRef.instance.changeStep) {
      this.componentRef.instance.changeStep.subscribe(index => {
        this.changeStepByClick(index);
      })
    }
  }

  /**
   * Write data from each step in localstorage
   */
  public writeStepsData (): void {
    this.storingData.step = this.step;
    if (this.step === 0) {
      this.storingData.plan = this._registrationService.plan;
    }
    if (this.currentFormValue) {
      const index = this.storingData.forms.findIndex(data => data.stepName === this.currentFormValue.stepName);
      if (index >= 0) {
        this.storingData.forms[index] = this.currentFormValue;
      } else {
        this.storingData.forms.push(this.currentFormValue);
      }
    }
    delete this.currentFormValue;
  }

  /**
   * Get data for stest by stepname
   */
  public readStepData (stepName: string): any {
    return this.storingData.forms.find(data => data.stepName === stepName);
  }

  /**
   * Next step
   */
  public nextStep (): void {
    const step = this.step + 1;
    this.changeStep(step, true);
  }

  /**
   * Prev step
   */
  public prevStep (): void {
    const step = this.step - 1;
    this.changeStep(step, false);
  }

  /**
   * Save data from memory to localstorage
   */
  public saveData () {
    this.storingData.plan = this._registrationService.plan;
    this.storingData.step = this.step;
    localStorage.setItem('registration_data', JSON.stringify(this.storingData));
  }

  /**
   * Change step by click (need to finish)
   */
  public changeStepByClick (index: number) {
    // this.steps[this.plan].steps[this.step].selected = false;
    // this.step = index;
    // this.steps[this.plan].steps[this.step].selected = true;
    // this.createComponent();
  }

  /**
   * Step change functionality
   */
  private async changeStep (step: number, dir: boolean) {
    let valid = this.formValidation(step);
    const enableQuery = this._registrationService.reCaptchaValue || this.storingData.id;
    if (valid) {
      let nextTo = true;
      this.writeStepsData();
      if (dir && enableQuery) {
        this._registrationService.disableNavigation = true;
        nextTo = await this.createRegistrationQuery();
        this._registrationService.disableNavigation = false;
      }
      if (!nextTo) {
        step = 0;
        this._registrationService.reCaptchaValue = null;
        this.resetStoringData()
      }
      this.step = step;
      this.createComponent();
      this.writeStepsData();
      this.saveData();
    }
  }

  /**
   * Validate data for each form on steps
   */
  public formValidation (step: number) {
    let valid = true;
    this._registrationService.reCaptchaError = false;
    const token = this._registrationService.reCaptchaValue;
    const isPrev = this.step < step;
    if (this.step === 2) {
      this._registrationService.reCaptchaError = !token;
    }
    if (this.step !== 0 && isPrev) {
      const data = this.componentRef.instance.checkForms;
      data.forEach(item => {
        Object.keys(item.controls).forEach(control => {
          const elem = document.getElementById(control);
          if (item.controls[control].valid || item.controls[control].disabled) {
            this._renderer.removeClass(elem, 'invalid');
            this._renderer.addClass(elem, 'valid');
          } else {
            this._renderer.removeClass(elem, 'valid');
            this._renderer.addClass(elem, 'invalid');
            if (valid) {
              valid = false;
            }
          }
        });
      });
      if (valid && this.step === 2 && !this._registrationService.disableReCaptcha) {
        valid = !!token;
      }
    }

    return valid;
  }

  /**
   * Reset form data exception of address step
   */
  public resetStoringData () {
    const parseData = this.storingData;
    parseData.dataPlan = null;
    parseData.payment = null;
    parseData.plan = 'free';
    parseData.step = null;
    parseData.id = null;
    parseData.forms.forEach((form, index) => {
      if (form.stepName !== 'address') {
        parseData.forms.splice(index, 1);
      }
    });
    this.saveData();
  }

  /**
   * Receive data for RegistrationDto
   */
  public registrationData (): RegistrationDto {
    const address = this.storingData.forms.find(item => item.stepName === 'address');
    const license = this.storingData.forms.find(item => item.stepName === 'license');
    const account = this.storingData.forms.find(item => item.stepName === 'account');
    const payment = this.storingData.forms.find(item => item.stepName === 'payment');
    const customIDPs = Array<string>();
    const addressFormInvoice = address ? address.values.invoiceForm : null;
    const addressForm = address ? address.values.form : null;
    const registrationData = new RegistrationDto();
    let invoiceCountry = '';
    let primaryCountry = '';
    if (addressForm) {
      primaryCountry = Object.keys(this._registrationService.countries).find(data => {
        return this._registrationService.countries[data] === addressForm.country;
      });
    }
    if (addressFormInvoice) {
      invoiceCountry = Object.keys(this._registrationService.countries).find(data => {
        return this._registrationService.countries[data] === addressFormInvoice.countryInvoice;
      });
    }
    registrationData.planId = this.storingData.dataPlan.id;
    registrationData.planPriceId = this.storingData.dataPlan.priceId;
    if (license) {
      registrationData.userLicenseCount = license.values.form.license;
    }
    if (address) {
      registrationData.subscriptionName = address.values.subscriptionType === 'Company' ? addressForm.companyName : addressForm.firstName + ' ' + addressForm.lastName,
        registrationData.primaryAddressCompanyName = addressForm.companyName,
        registrationData.primaryAddressCompanyContactPerson = addressForm.contactPerson,
        registrationData.primaryAddressCompanyDepartment = addressForm.department,
        registrationData.primaryAddressFirstName = addressForm.firstName,
        registrationData.primaryAddressLastName = addressForm.lastName,
        registrationData.primaryAddressStreet = addressForm.street,
        registrationData.primaryAddressZip = addressForm.zip,
        registrationData.primaryAddressCity = addressForm.city,
        registrationData.primaryAddressCountry = primaryCountry,
        registrationData.primaryAddressEmail = addressForm.email,
        registrationData.primaryAddressPhone = addressForm.phone,
        registrationData.usePrimaryAddressForInvoice = address.values.sameInvoice,
        registrationData.isCompany = !!(address.values.subscriptionType === 'Company')

      if (!address.values.sameInvoice) {
        registrationData.invoiceAddressCompanyName = addressFormInvoice ? addressFormInvoice.companyNameInvoice : '';
        registrationData.invoiceAddressCompanyContactPerson = addressFormInvoice ? addressFormInvoice.contactPersonInvoice : '';
        registrationData.invoiceAddressCompanyDepartment = addressFormInvoice ? addressFormInvoice.departmentInvoice : '';
        registrationData.invoiceAddressFirstName = addressFormInvoice ? addressFormInvoice.firstNameInvoice : '';
        registrationData.invoiceAddressLastName = addressFormInvoice ? addressFormInvoice.lastNameInvoice : '';
        registrationData.invoiceAddressStreet = addressFormInvoice ? addressFormInvoice.streetInvoice : '';
        registrationData.invoiceAddressZip = addressFormInvoice ? addressFormInvoice.zipInvoice : '';
        registrationData.invoiceAddressCity = addressFormInvoice ? addressFormInvoice.cityInvoice : '';
        registrationData.invoiceAddressCountry = invoiceCountry;
        registrationData.invoiceAddressEmail = addressFormInvoice ? addressFormInvoice.emailInvoice : '';
        registrationData.invoiceAddressPhone = addressFormInvoice ? addressFormInvoice.phoneInvoice : '';
      }
    }

    if (account) {
      account.values.idps.forEach(data => {
        if (data.select) {
          customIDPs.push(data.scheme);
        }
      });
      registrationData.defaultIdpAuthenticateSchemes = JSON.stringify(customIDPs);
      registrationData.adminUserFirstName = account.values.form.firstName;
      registrationData.adminUserLastName = account.values.form.lastName;
      registrationData.adminUserEmail = account.values.form.email;
      registrationData.adminUserLoginName = account.values.form.username ? account.values.form.username : '';
    }

    if (payment) {
      registrationData.paymentMethodId = payment.values.payment.id;
    }

    return registrationData;
  }

  /**
   * Storing data on the backend
   */
  public async createRegistrationQuery (): Promise<any> {
    const registrationData = this.registrationData();
    const id = this.storingData.id;
    const recaptcha = this._registrationService.reCaptchaValue;

    if (!id) {
      let result = true;
      registrationData.reCaptchaToken = recaptcha;
      const create = await this._registrationService.createRegistrationQuery(registrationData).catch(err2 => {
        this._registrationService.disableReCaptcha = false;
        this._registrationService.reCaptchaValue = null;
        result = false;
      });

      if (create) {
        this._registrationService.disableReCaptcha = true;
        this._registrationService.reCaptchaValue = null;
        this.storingData.id = create.id;
        this.saveData();
      }

      return result;
    } else {
      let result = true;
      await this._registrationService.updateRegistrationQuery(id, registrationData).catch(err2 => {
        this._registrationService.disableReCaptcha = false;
        this._registrationService.reCaptchaValue = null;
        swal('Registration is outdated', 'Please try again', 'error');
        result = false
      });
      return result;
    }
  }

  /**
   * Step email. Check email if everything ok then make a user commit
   */
  public verify () {
    this._registrationService.messageError = null;
    const id = this.storingData.id;
    const code = this.currentFormValue.values.form.code;
    this._registrationService.disableNavigation = true;
    if (code) {
      this._registrationService.verifyUser(id, code).then(data => {
        this._registrationService.commitRegistration(id).then(commit => {
          // this._registrationService.mapUserExternalLogin(id).then(login => {
          //   this._registrationService.disableNavigation = false;
          // }).catch(err2 => {
          //   this._registrationService.messageError = 'Login not created';
          //   this._registrationService.disableNavigation = false;
          // });
          this.oAuthService.initImplicitFlow();
        }).catch(err2 => {
          this._registrationService.messageError = 'Failed to create user';
          this._registrationService.disableNavigation = false;
        });
      }).catch(err2 => {
        this._registrationService.messageError = 'Verify code is not correct';
        this._registrationService.disableNavigation = false;
      });
    } else {
      this._registrationService.messageError = 'Please enter "verify code"';
      this._registrationService.disableNavigation = false;
    }
  }

  /**
   * Destroy any step
   */
  public destroyComponent (): void {
    this.componentRef.destroy();
  }
}