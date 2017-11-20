import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  MatCheckboxModule
} from '@angular/material';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DBModule } from '@ngrx/db';

import { Http, Response } from '@angular/http';
import { RestangularModule } from 'ngx-restangular';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PrettyJsonModule, SafeJsonPipe } from 'angular2-prettyjson';
import { JsonPipe } from '@angular/common';

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

@NgModule({
  declarations: [
    AppComponent,
    VisualiserComponent,
    SearchSimilarDialog,
    DetailComponent,
    ConnecUiComponent,
    EntityAttributeComponent
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
    PrettyJsonModule,
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
    AppRoutingModule
  ],
  providers: [
    ConnecApiService,
    MnoeApiService,
    {provide: JsonPipe, useClass: SafeJsonPipe}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
