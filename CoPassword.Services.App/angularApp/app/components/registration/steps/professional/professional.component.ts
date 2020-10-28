import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DynamicFormComponent } from '@4tecture/ui-controls';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegistrationService } from '../../../../services/registration.service';

@Component({
  selector: 'app-professional',
  templateUrl: './professional.component.html'
})

export class ProfessionalComponent implements OnInit {

  @Input() plan: any;
  @Input() data: any;
  @Input() step: number;
  @Input() steps: any[];
  public subscriptionForm;
  public address = Array();
  public countries = Array();
  public checkForms = Array();
  public sameInvoice: boolean;
  public invoiceAddress = Array();
  public subscriptionType = 'Company';
  public selectCountry = { country: 'UA' };
  public selectCountryInvoice = { country: 'UA' };
  @Output() formData = new EventEmitter<any>();
  @Output() changeStep = new EventEmitter<number>();
  @Output() recaptchaValue = new EventEmitter<any>();
  @ViewChild('dynamicForm') public dynamicForm: DynamicFormComponent;
  @ViewChild('dynamicFormInvoice') public dynamicFormInvoice: DynamicFormComponent;

  constructor (
    public readonly registrationService: RegistrationService
  ) { }

  ngOnInit () {
    this.subscriptionType = this.data ? this.data.values.subscriptionType : 'Company';
    this.sameInvoice = this.data ? this.data.values.sameInvoice : true;

    this.subscriptionForm = new FormGroup({
      subscription: new FormControl(this.subscriptionType)
    });

    this.subscriptionForm.valueChanges.subscribe(data => {
      this.subscriptionType = data.subscription;
      this.insertDataIntoForm(data.subscription);
    });

    this.insertDataIntoForm(this.subscriptionType);

    Object.keys(this.registrationService.countries).forEach(country => {
      this.countries.push(this.registrationService.countries[country]);
    });
  }

  private insertDataIntoForm (type: string) {
    this.changeSubscription(type);
    if (this.data) {
      const country = Object.keys(this.registrationService.countries).find(data => {
        return this.registrationService.countries[data] === this.data.values.form.country;
      });
      if (country) {
        this.selectCountry.country = country;
      }
      Object.keys(this.data.values.form).forEach(data => {
        const field = this.address.find(item => data === item.name);
        if (field) {
          field['value'] = this.data.values.form[data];
        }
      });
      if (this.data.values.invoiceForm) {
        const country = Object.keys(this.registrationService.countries).find(data => {
          return this.registrationService.countries[data] === this.data.values.invoiceForm.countryInvoice;
        });
        if (country) {
          this.selectCountryInvoice.country = country;
        }
        Object.keys(this.data.values.invoiceForm).forEach(data => {
          const field = this.invoiceAddress.find(item => data === item.name);
          if (field) {
            field['value'] = this.data.values.invoiceForm[data];
          }
        });
      }
    }
  }

  public changeSubscription (subscription: string) {
    if (subscription === 'Private') {
      this.address = [
        {type: 'input', placeholder: 'Enter first name', label: 'First Name', name: 'firstName', error: 'The field "First Name" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter last name', label: 'Last Name', name: 'lastName', error: 'The field "Last Name" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter street and number', label: 'Street & Nr', name: 'street', error: 'The field "Street" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'ZIP', label: 'ZIP / City', name: 'zip', error: 'The field "ZIP" is wrong', validation: [Validators.required, RegistrationService.zipValidate(this.selectCountry)] },
        {type: 'input', placeholder: 'City', label: '', name: 'city', error: 'The field "City" cannot be empty', validation: [Validators.required] },
        {type: 'select', placeholder: 'Select country',  label: 'Country', name: 'country', value: '', error: 'The field "Country" should be select', options: this.countries, validation: [Validators.required] },
        {type: 'input', placeholder: 'E-Mail example (mail@example.com)', label: 'E-Mail', name: 'email', error: 'Email incorrect', validation: [Validators.required, Validators.pattern('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])')] },
        {type: 'input', placeholder: 'Number example (+123456789876)', label: 'Phone', name: 'phone', error: 'Phone number incorrect example (+55 11 99999-5555)', validation: [Validators.required, Validators.pattern('\\(?\\+[0-9]{1,3}\\)? ?-?[0-9]{1,3} ?-?[0-9]{3,5} ?-?[0-9]{4}( ?-?[0-9]{3})? ?(\\w{1,10}\\s?\\d{1,6})?')] }
      ];
      this.invoiceAddress = [
        {type: 'input', placeholder: 'Enter first name', label: 'First Name', name: 'firstNameInvoice', error: 'The field "First Name" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter last name', label: 'Last Name', name: 'lastNameInvoice', error: 'The field "Last Name" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter street and number', label: 'Street & Nr', name: 'streetInvoice', error: 'The field "Street" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'ZIP', label: 'ZIP / City', name: 'zipInvoice', error: 'The field "ZIP" is wrong', validation: [Validators.required, RegistrationService.zipValidate(this.selectCountryInvoice)] },
        {type: 'input', placeholder: 'City', label: '', name: 'cityInvoice', error: 'The field "City" cannot be empty', validation: [Validators.required] },
        {type: 'select', placeholder: 'Select country',  label: 'Country', name: 'countryInvoice', value: '', error: 'The field "Country" should be select', options: this.countries, validation: [Validators.required] },
        {type: 'input', placeholder: 'E-Mail example (mail@example.com)', label: 'E-Mail', name: 'emailInvoice', error: 'Email incorrect', validation: [Validators.required, Validators.pattern('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])')] },
        {type: 'input', placeholder: 'Number example (+123456789876)', label: 'Phone', name: 'phoneInvoice', error: 'Phone number incorrect example (+55 11 99999-5555)', validation: [Validators.required, Validators.pattern('\\(?\\+[0-9]{1,3}\\)? ?-?[0-9]{1,3} ?-?[0-9]{3,5} ?-?[0-9]{4}( ?-?[0-9]{3})? ?(\\w{1,10}\\s?\\d{1,6})?')] }
      ];
    } else {
      this.address = [
        {type: 'input', placeholder: 'Enter company name', label: 'Company Name', name: 'companyName', error: 'The field "Company Name" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter contact person', label: 'Contact Person', name: 'contactPerson', error: 'The field "Contact Person" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Department', label: 'Department', name: 'department', error: 'The field "Department" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter street and number', label: 'Street & Nr', name: 'street', error: 'The field "Street" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'ZIP', label: 'ZIP / City', name: 'zip', error: 'The field "ZIP" is wrong', validation: [Validators.required, RegistrationService.zipValidate(this.selectCountry)] },
        {type: 'input', placeholder: 'City', label: '', name: 'city', error: 'The field "City" cannot be empty', validation: [Validators.required] },
        {type: 'select', placeholder: 'Select country',  label: 'Country', name: 'country', value: '', error: 'The field "Country" should be select', options: this.countries, validation: [Validators.required] },
        {type: 'input', placeholder: 'E-Mail example (mail@example.com)', label: 'E-Mail', name: 'email', error: 'Email incorrect', validation: [Validators.required, Validators.pattern('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])')] },
        {type: 'input', placeholder: 'Number example (+123456789876)', label: 'Phone', name: 'phone', error: 'Phone number incorrect example (+55 11 99999-5555)', validation: [Validators.required, Validators.pattern('\\(?\\+[0-9]{1,3}\\)? ?-?[0-9]{1,3} ?-?[0-9]{3,5} ?-?[0-9]{4}( ?-?[0-9]{3})? ?(\\w{1,10}\\s?\\d{1,6})?')] }
      ];
      this.invoiceAddress = [
        {type: 'input', placeholder: 'Enter company name', label: 'Company Name', name: 'companyNameInvoice', error: 'The field "Company Name" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter contact person', label: 'Contact Person', name: 'contactPersonInvoice', error: 'The field "Contact Person" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Department', label: 'Department', name: 'departmentInvoice', error: 'The field "Department" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'Enter street and number', label: 'Street & Nr', name: 'streetInvoice', error: 'The field "Street" cannot be empty', validation: [Validators.required] },
        {type: 'input', placeholder: 'ZIP', label: 'ZIP / City', name: 'zipInvoice', error: 'The field "ZIP" is wrong', validation: [Validators.required, RegistrationService.zipValidate(this.selectCountryInvoice)] },
        {type: 'input', placeholder: 'City', label: '', name: 'cityInvoice', error: 'The field "City" cannot be empty', validation: [Validators.required] },
        {type: 'select', placeholder: 'Select country',  label: 'Country', name: 'countryInvoice', value: '', error: 'The field "Country" should be select', options: this.countries, validation: [Validators.required] },
        {type: 'input', placeholder: 'E-Mail example (mail@example.com)', label: 'E-Mail', name: 'emailInvoice', error: 'Email incorrect', validation: [Validators.required, Validators.pattern('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])')] },
        {type: 'input', placeholder: 'Number example (+123456789876)', label: 'Phone', name: 'phoneInvoice', error: 'Phone number incorrect example (+55 11 99999-5555)', validation: [Validators.required, Validators.pattern('\\(?\\+[0-9]{1,3}\\)? ?-?[0-9]{1,3} ?-?[0-9]{3,5} ?-?[0-9]{4}( ?-?[0-9]{3})? ?(\\w{1,10}\\s?\\d{1,6})?')] }
      ];
    }
  }

  public sameInvoiceAddress () {
    const invoiceValue = {};
    this.selectCountryInvoice.country = this.selectCountry.country;
    this.dynamicFormInvoice.form.controls['zipInvoice'].updateValueAndValidity();
    Object.keys(this.dynamicForm.value).forEach(data => {
      if (data === 'country') {
        invoiceValue[data + 'Invoice'] = this.dynamicForm.value[data] ? this.dynamicForm.value[data] : '';
      } else {
        invoiceValue[data + 'Invoice'] = this.dynamicForm.value[data];
      }
    });
    this.dynamicFormInvoice.form.reset(invoiceValue);
  }

  public resolved (data: any) {
    this.recaptchaValue.emit(data);
  }

  public execute (data: any) {
    this.recaptchaValue.emit(data);
  }

  public changeStepByClick (index: number, select: boolean, complite: boolean) {
    if (!select && complite) {
      this.changeStep.emit(index);
    }
  }

  private sendFormData () {
    this.formData.emit({
      form: this.dynamicForm.form.value,
      sameInvoice: this.sameInvoice,
      subscriptionType: this.subscriptionType,
      invoiceForm: this.dynamicFormInvoice.form.value
    });
  }

  ngAfterViewInit () {
    this.dynamicForm.form.controls['zip'].updateValueAndValidity();
    this.dynamicFormInvoice.form.controls['zipInvoice'].updateValueAndValidity();
    this.checkForms.push(this.dynamicForm.form, this.dynamicFormInvoice.form);
    this.dynamicForm.form.valueChanges.subscribe(data => {
      const oldValue = this.selectCountry.country;
      const country = Object.keys(this.registrationService.countries).find(item => {
        return this.registrationService.countries[item] === data.country
      });
      if (country) {
        this.selectCountry.country = country;
      }
      const newValue = this.selectCountry.country;
      if (oldValue !== newValue) {
        this.dynamicForm.form.controls['zip'].updateValueAndValidity();
      }
      if (this.sameInvoice) {
        this.sameInvoiceAddress();
      }
      this.sendFormData();
    });
    this.dynamicFormInvoice.form.valueChanges.subscribe(data => {
      const oldValue = this.selectCountryInvoice.country;
      const country = Object.keys(this.registrationService.countries).find(item => {
        return this.registrationService.countries[item] === data.countryInvoice
      });
      if (country) {
        this.selectCountryInvoice.country = country;
      }
      const newValue = this.selectCountryInvoice.country;
      if (oldValue !== newValue) {
        this.dynamicFormInvoice.form.controls['zipInvoice'].updateValueAndValidity();
      }
      this.sendFormData();
    });
  }

}
