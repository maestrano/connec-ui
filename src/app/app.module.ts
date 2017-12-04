import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';

import {
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatNativeDateModule
} from '@angular/material';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DBModule } from '@ngrx/db';

import { Http, Response } from '@angular/http';
import { RestangularModule } from 'ngx-restangular';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { JsonSchemaFormModule } from 'angular2-json-schema-form';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ConnecApiService } from './services/connec-api.service';
import { MnoeApiService } from './services/mnoe-api.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { VisualiserComponent, SearchSimilarDialog } from './visualiser/visualiser.component';

import { EntitiesPageEffects } from './effects/entities_page';

import * as fromRoot from './reducers/index';

import { schema } from './db';
import { DetailComponent } from './detail/detail.component';
import { ConnecUiComponent } from './connec-ui/connec-ui.component';
import { EntityAttributeComponent } from './entity-attribute/entity-attribute.component';
import { CreateRecordComponent } from './create-record/create-record.component';
import { MergeRecordsComponent } from './merge-records/merge-records.component';

export function initConnecApiService(connecApiService: ConnecApiService) {
  return () => connecApiService.configure();
}

export function initMnoeApiService(mnoeApiService: MnoeApiService) {
  return () => mnoeApiService.configure();
}

@NgModule({
  declarations: [
    AppComponent,
    VisualiserComponent,
    SearchSimilarDialog,
    DetailComponent,
    ConnecUiComponent,
    EntityAttributeComponent,
    CreateRecordComponent,
    MergeRecordsComponent
  ],
  entryComponents: [
    SearchSimilarDialog
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(fromRoot.reducers),
    EffectsModule.forRoot([EntitiesPageEffects]),
    DBModule.provideDB(schema),
    RestangularModule.forRoot(),
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatTabsModule,
    MatButtonToggleModule,
    JsonSchemaFormModule,
    AppRoutingModule
  ],
  providers: [
    ConnecApiService,
    MnoeApiService,
    {provide: APP_INITIALIZER, useFactory: initConnecApiService, deps: [ConnecApiService], multi: true},
    {provide: APP_INITIALIZER, useFactory: initMnoeApiService, deps: [MnoeApiService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
