import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { OAuthService } from '../../../services/oauth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  public langs = Array<string>();
  public lang: string;

  constructor (
    private oAuthService: OAuthService,
    private _settingsService: SettingsService,
  ) { }

  ngOnInit () {
    this.langs = this._settingsService.langs;
    this.lang = this._settingsService.currentLang;
  }

  /**
   * Change language globally
   */
  changeLang (lang: string) {
    this._settingsService.setLang(lang);
    this.lang = this._settingsService.currentLang;
  }

}
