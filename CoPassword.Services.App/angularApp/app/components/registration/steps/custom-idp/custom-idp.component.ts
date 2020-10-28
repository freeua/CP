import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicFormComponent } from '@4tecture/ui-controls';
import { RegistrationService } from "../../../../services/registration.service";

@Component({
  selector: 'app-custom-idp',
  templateUrl: './custom-idp.component.html',
})
export class CustomIdpComponent implements OnInit {

  @Input() data: any;
  @Input() step: number;
  @Input() steps: any[];
  @Input() plan: string;
  public IDPOptions = Array();
  public checkForms = Array();
  @Output() formData = new EventEmitter<any>();
  @Output() changeStep = new EventEmitter<number>();
  @ViewChild('dynamicForm') dynamicForm: DynamicFormComponent;
  public customIdp = [
    { type: 'select', placeholder: 'Select type',  label: 'IDP Type', value: '', name: 'idpType', error: 'The field "IDP Type" should be select', options: ['ADFS'], validation: [Validators.required] },
    { type: 'input', placeholder: 'Enter scheme name', label: 'Authentication Scheme', name: 'scheme', error: 'The field "Authentication Scheme" cannot be empty', validation: [Validators.required] },
    { type: 'input', placeholder: 'Enter name', label: 'Name', name: 'name', error: 'The field "Name" cannot be empty', validation: [Validators.required] },
    { type: 'input', placeholder: 'Enter position', label: 'Position', name: 'position', error: 'The field "Position" cannot be empty', validation: [Validators.required] }
  ];

  constructor (
    public readonly registrationService: RegistrationService
  ) { }

  ngOnInit () {
    this.IDPOptions = [
      { key: 'Some1', value: 'some1' },
      { key: 'Some2', value: 'some2' },
      { key: 'Some3', value: 'some3' },
      { key: 'Some4', value: 'some4' }
    ]
  }

  public changeStepByClick (index: number, select: boolean, complite: boolean) {
    if (!select && complite) {
      this.changeStep.emit(index);
    }
  }

  ngAfterViewInit () {
    this.formData.emit({form: this.dynamicForm.form.value});
  }
}
