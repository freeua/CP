import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DynamicFormComponent, FieldConfig } from '@4tecture/ui-controls';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-licensing',
  templateUrl: './licensing.component.html'
})
export class LicensingComponent implements OnInit {

  public sum = 0;
  public price = 0;
  public date: Date;
  @Input() plan: any;
  @Input() data: any;
  @Input() step: number;
  @Input() steps: any[];
  public checkForms = Array();
  public licensingForm = Array<FieldConfig>();
  @Output() formData = new EventEmitter<any>();
  @Output() changeStep = new EventEmitter<number>();
  @Output() recaptchaValue = new EventEmitter<any>();
  @ViewChild('dynamicForm') public dynamicForm: DynamicFormComponent;

  ngOnInit() {
    this.price = (this.plan.free) ? 0 : Number(this.plan.price);
    this.licensingForm = [
      { type: 'select', placeholder: 'Select duration',  label: 'Select duration', name: 'duration', value: 'Annual', error: 'The field "Duration" should be select', options: ['Annual', 'Monthly'], validation: [Validators.required] },
      { type: 'input', disabled: this.plan.free, inputType: 'number', placeholder: 'User licenses', label: 'User licenses', value: '1', name: 'license', error: 'The field "User licenses" can\'t be empty it has to have atleast one number which is  more than 0', validation: [Validators.required, Validators.pattern('^[1-9][0-9]*$')] },
    ];
    this.insertDataIntoForm();
  }

  private insertDataIntoForm () {
    if (this.data) {
      this.licensingForm[1]['value'] = this.plan.free ? 1 : this.data.values.form.license;
      this.licensingForm[0]['value'] = this.data.values.form.duration;
      this.calc({
        duration: this.data.values.form.duration,
        license: this.plan.free ? 1 : this.data.values.form.license
      });
    } else {
      this.calc({duration: 'Annual', license: 1});
    }
  }

  private amount (duration = 0, license = 1): number {
    return this.sum = this.price * duration * Number(license);
  }

  private calc (data: any) {
    const license = this.plan.free ? 1 : Number(Math.abs(data.license));
    const duration = data.duration === 'Annual' ? 12 : 1;
    this.date = new Date(new Date().setMonth(new Date().getMonth() + duration));
    this.sum = this.amount(duration, license);
  }

  private sendFormData (duration: string, license: number) {
    this.formData.emit({
      amount: this.sum,
      form: {
        duration: duration,
        license: license
      }
    });
  }

  ngAfterViewInit () {
    this.checkForms.push(this.dynamicForm.form);
    this.sendFormData(this.dynamicForm.form.controls.duration.value, this.dynamicForm.form.controls.license.value);
    this.dynamicForm.form.valueChanges.subscribe(data => {
      this.calc(data);
      this.sendFormData(data.duration, this.plan.free ? 1 : data.license);
    });
  }

}
