import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BlankComponent } from './blank.component';
import { BasicComponent } from './basic.component';
import { SidebarComponent } from '../../partials/sidebar/sidebar.component';
import { NavbarComponent } from '../../partials/navbar/navbar.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { TranslateModule } from 'ng2-translate/ng2-translate';

@NgModule({
    declarations: [
      BlankComponent,
      BasicComponent,
      SidebarComponent,
      NavbarComponent,
      FooterComponent,
    ],
    imports: [
      BrowserModule,
      RouterModule,
      TranslateModule
    ],
    exports: [
      BlankComponent,
      BasicComponent,
      SidebarComponent,
      NavbarComponent,
      FooterComponent,
    ]
})

export class LayoutsModule { }
