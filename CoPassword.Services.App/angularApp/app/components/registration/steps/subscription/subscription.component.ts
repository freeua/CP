import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html'
})

export class SubscriptionComponent implements OnInit {

  @Output() plan = new EventEmitter<any>();
  @Input() planList = Array();

  ngOnInit() {

  }

  public selectPlan (plan: any) {
    this.plan.emit(plan);
  }

}
