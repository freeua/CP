import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DynamicFormComponent } from '@4tecture/ui-controls';
import { RegistrationService } from '../../../../services/registration.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {

  public sum = 0;
  @Input() data: any;
  @Input() plan: any;
  @Input() steps: any[];
  @Input() step: number;
  public payments = Array();
  public paymentForm: FormGroup;
  public checkForms = Array();
  @Output() formData = new EventEmitter<any>();
  @Output() changeStep = new EventEmitter<number>();
  @ViewChild('dynamicForm') dynamicForm: DynamicFormComponent;

  constructor (
    private readonly _registrationService: RegistrationService
  ) { }

  ngOnInit () {
    const data = localStorage.getItem('registration_data');
    const parseData = JSON.parse(data);
    const license = parseData.forms.find(item => item.stepName === 'license');
    const address = parseData.forms.find(item => item.stepName === 'address');
    const country = address.values.form.country;
    this.sum = license.values.amount;
    this.paymentForm = new FormGroup({
      payment: new FormControl('', [Validators.required])
    });

    this.paymentForm.valueChanges.subscribe(data => {
      const payment = this.payments.find(inv => inv.name === data.payment);
      this.formData.emit({form: data, payment: payment});
    });

    this._registrationService.getAvailablePaymentMethods(parseData.id).then(data => {
      this.payments = data;
      if (country !== 'Schweiz' && this.sum <= 500) {
        const index = this.payments.findIndex(inv => inv.name === 'Invoice');
        if (index >= 0) {
          this.payments.splice(index, 1);
        }
      }
      if (this.data) {
        this.paymentForm.setValue({
          payment: this.data.values.form.payment
        });
      }
    });

    this.checkForms.push(this.paymentForm);
  }

  public changeStepByClick (index: number, select: boolean, complite: boolean) {
    if (!select && complite) {
      this.changeStep.emit(index);
    }
  }
}
