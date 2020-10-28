import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicFormComponent } from '@4tecture/ui-controls';
import { RegistrationService } from '../../../../services/registration.service';

declare let swal: any;

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html'
})
export class EmailVerifyComponent implements OnInit, AfterViewInit {

  public id: string;
  @Input() data: any;
  @Input() step: number;
  @Input() steps: any[];
  @Input() plan: string;
  public IDPOptions = Array();
  public checkForms = Array();
  @Output() formData = new EventEmitter<any>();
  @Output() changeStep = new EventEmitter<number>();
  @ViewChild('dynamicForm') dynamicForm: DynamicFormComponent;

  public form = [
    { type: 'input', disabled: true, placeholder: 'Email', label: 'Email', name: 'email', error: 'The field "Email" cannot be empty', validation: [Validators.required] },
    { type: 'input', placeholder: 'Verify code', label: 'Verify code', name: 'code', error: 'The field "Verify code" cannot be empty', validation: [Validators.required] }
  ];

  constructor (
    public readonly registrationService: RegistrationService
  ) { }

  ngOnInit () {
    this.registrationService.messageError = null;
    const data = localStorage.getItem('registration_data');
    const parseData = JSON.parse(data);
    this.id = parseData.id;
    const account = parseData.forms.find(item => item.stepName === 'account');
    if (account) {
      this.form[0]['value'] = account.values.form.email;
    }
  }

  public changeStepByClick (index: number, select: boolean, complite: boolean) {
    if (!select && complite) {
      this.changeStep.emit(index);
    }
  }

  public sendVerification () {
    swal('We sent you a message in the mail', 'Please check your mail');
    this.registrationService.sendVerification(this.id).then(data => console.log(data));
  }

  ngAfterViewInit () {
    this.formData.emit({ form: this.dynamicForm.form.value });
    this.dynamicForm.form.valueChanges.subscribe(data => {
      this.formData.emit({ form: this.dynamicForm.form.value });
    })
  }
}
