import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-oidc',
  templateUrl: './signin-oidc.component.html'
})
export class SigninOidcComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    setTimeout(() => this.router.navigate(['/vaults'], {queryParams: {'type': 'user'}}), 2000);
  }

}
