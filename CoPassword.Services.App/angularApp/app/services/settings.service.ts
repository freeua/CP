import { Injectable } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { Http } from '@angular/http';
import { TranslateStaticLoader } from 'ng2-translate';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { SettingsService as UiSettingsService } from '@4tecture/ui-controls';

@Injectable()
export class SettingsService {

    public langs = ['en', 'ru'];
    public currentLang: string;
    public sidebar = true;

    constructor (
        private readonly _dragulaService: DragulaService,
        private readonly _translate: TranslateService,
        private readonly _settingsService: UiSettingsService
    ) {

        /** Drag and drop fields set settings */
        _dragulaService.createGroup('fields', {
            moves: function (el, container, handle) {
                return (handle.className.indexOf('arrows') > -1);
            }
        });

        _dragulaService.createGroup('template-list', {
          direction: 'vertical',
            moves: function (el, container, handle) {
                return (handle.className.indexOf('arrows') > -1);
            }
        });

        _dragulaService.createGroup('tree-view-drag', {
            revertOnSpill: true,
            direction: 'vertical',
            moves: function (el, container, handle) {
                return !!~handle.className.indexOf('tree-drag');
            },
            accepts: function (el, target, hendler) {
                return !(target['offsetParent']['id']);
            }
        });

        _dragulaService.createGroup('tree-vault-drag', {
            direction: 'vertical',
            moves: function (el, container, handle) {
                return !!~handle.className.indexOf('vault-drag');
            },
            accepts: function (el, target) {
                return true;
            }
        });

        this._settingsService.settings.font = 'Verdana';

        /** Set Language */
        this.setLang('en');
    }

    public proAuthServiceUrl () {
        return window['copasswordenv']['proAuthServiceUrl'];
    }

    public appUrl () {
        return window['copasswordenv']['appUrl'];
    }

    public deploymentEnvironment () {
        return window['copasswordenv']['deploymentEnvironment'];
    }

    public notificationsServiceUrl () {
        return window['copasswordenv']['notificationsServiceUrl'];
    }

    public setLang(param: string) {
        this.currentLang = (~this.langs.indexOf(param)) ? param : 'en';
        this._translate.setDefaultLang(this.currentLang);
        this._translate.use(this.currentLang);
    }

}

export function secretManagementServiceClient() {
    return window['copasswordenv']['secretManagementServiceUrl'];
}

export function pkiServiceClient () {
    return window['copasswordenv']['pkiServiceUrl'];
}

export function userManagementServiceClient () {
    return window['copasswordenv']['userManagementServiceUrl'];
}

export function  reCaptchaKey () {
    return { siteKey: window['copasswordenv']['reCaptchaSiteKey'] }
}

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, './assets/i18n', '.json');
}
