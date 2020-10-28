import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  DynamicFormComponent, FieldConfig, IComponentInModal, ITableActions,
  ITableSettings
} from '@4tecture/ui-controls';
import { Validators } from '@angular/forms';
import { RegistrationService } from '../../../../services/registration.service';
import { forEach } from "@angular/router/src/utils/collection";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, AfterViewInit {

  @Input() plan: any;
  @Input() data: any;
  @Input() step: number;
  @Input() steps: any[];
  public IDPList = Array();
  public checkForms = Array();
  public isEnterprise = false;
  public enableCusomIdp = false;
  public vaultSettings: ITableSettings;
  public accountForm = Array<FieldConfig>();
  @Output() formData = new EventEmitter<any>();
  public vaultModalSettings: IComponentInModal;
  public vaultEditControlMethods: ITableActions[];
  @Output() changeStep = new EventEmitter<number>();
  @Output() recaptchaValue = new EventEmitter<any>();
  @ViewChild('dynamicForm') public dynamicForm: DynamicFormComponent;

  constructor(
    public readonly registrationService: RegistrationService
  ) { }

  ngOnInit() {
    const data = localStorage.getItem('registration_data');
    const parseData = JSON.parse(data);
    const address = parseData.forms.find(item => item.stepName === 'address');
    this.isEnterprise = address.values.subscriptionType === 'Company' && !this.plan.free;
    this.enableCusomIdp = (this.registrationService.plan === 'custom');

    /** Control methods for vault fields*/
    this.vaultEditControlMethods = [];
    this.vaultSettings = {
      params: [
        { property: 'name', title: 'some' },
      ]
    };

    this.IDPList = [
      { name: 'Facebook', scheme: 'FacebookCoPasswordPublic', select: true },
      { name: 'Google', scheme: 'GoogleCoPasswordPublic', select: true },
      { name: 'Microsoft', scheme: 'MicrosoftCoPasswordPublic', select: true },
      { name: 'Twitter (2FA)', scheme: 'Twitter2FACoPasswordPublic', select: true },
      { name: 'Twitter', scheme: 'TwitterCoPasswordPublic', select: true },
      { name: 'User Store', scheme: 'UserStoreCoPasswordPublic', select: false }
    ];

    this.accountForm = [
      { type: 'input', placeholder: 'First Name', label: 'First Name', name: 'firstName', error: 'The field "???" should be filled', validation: [Validators.required] },
      { type: 'input', placeholder: 'Last Name', label: 'Last Name', name: 'lastName', error: 'The field "???" should be filled', validation: [Validators.required] },
      { type: 'input', placeholder: 'E-Mail', label: 'E-Mail', name: 'email', error: 'The field "???" should be filled', validation: [Validators.required, Validators.pattern('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])')] },
    ];

    const userStoreScheme = this.IDPList.find(item => item.scheme === 'UserStoreCoPasswordPublic');

    if (userStoreScheme.select) {
      this.accountForm.push({ type: 'input', placeholder: 'Username', label: 'Username', name: 'username', error: 'The field "???" should be filled', validation: [Validators.required] });
    }

    if (this.data) {
      this.insertDataIntoForm();
    } else {
      this.accountForm[0].value = address.values.form.firstName ? address.values.form.firstName : null;
      this.accountForm[1].value = address.values.form.lastName ? address.values.form.lastName : null;
      this.accountForm[2].value = address.values.form.email ? address.values.form.email : null;
    }
  }

  private insertDataIntoForm () {
    Object.keys(this.data.values.form).forEach(data => {
      const field = this.accountForm.find(item => data === item.name);
      if (field) {
        field['value'] = this.data.values.form[data];
      }
    });

    this.data.values.idps.forEach(data => {
      const scheme = this.IDPList.find(item => data.scheme === item.scheme);
      if (scheme) {
        scheme.select = data.select;
      }
    })
  }

  public changeProviders (item: any) {
    item.select = !item.select;
    if (item.scheme === 'UserStoreCoPasswordPublic') {
      this.manageUserNameField(item);
    }
    this.formData.emit({
      form: this.dynamicForm.form.value,
      idps: this.IDPList,
    });
  }

  public changePlan (value: boolean) {
    this.registrationService.plan = value ? 'custom' : 'paid';
  }

  public manageUserNameField (idp) {
    if (idp.select) {
      const field = {
        type: 'input',
        placeholder: 'Username',
        label: 'Username',
        name: 'username',
        error: 'The field "???" should be filled',
        validation: [Validators.required]
      };
      this.accountForm.push(field);
    } else {
      this.accountForm.splice(3, 1);
    }
  }

  ngAfterViewInit () {
    this.formData.emit({
      form: this.dynamicForm.form.value,
      idps: this.IDPList,
    });
    this.checkForms.push(this.dynamicForm.form);
    this.dynamicForm.form.valueChanges.subscribe(data => {
      this.formData.emit({
        form: data,
        idps: this.IDPList,
      });
    });
  }

}
