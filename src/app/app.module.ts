import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DBModule } from '@ngrx/db';

import { Http, Response } from '@angular/http';
import { RestangularModule, Restangular } from 'ngx-restangular';

import { AppComponent } from './app.component';

import { ConnecApiService } from './services/connec-api.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { VisualiserComponent } from './visualiser/visualiser.component';

import { EntitiesEffects } from './effects/entities';

import * as fromRoot from './reducers/index';

import { schema } from './db';

export function RestangularConfigFactory (RestangularProvider) {
  RestangularProvider.setBaseUrl('http://localhost:8080/api/v2');
  RestangularProvider.setDefaultHeaders({'Content-Type' : 'application/json'});
  // RestangularProvider.setDefaultHeaders({'Authorization': 'Bearer UDXPx-Xko0w4BRKajozCVy20X11MRZs1'});
  RestangularProvider.setRequestSuffix('.json');

  // Extract collection content
  RestangularProvider.setResponseExtractor(function(response, operation) {
    if (operation === 'getList') {
        // var newResponse = response.body;
        // newResponse.pagination = response.pagination;
        // newResponse.entities = response[Object.keys(response)[0]];
        // return newResponse;
        return response[Object.keys(response)[0]];
    }
    return response;
});

}

@NgModule({
  declarations: [
    AppComponent,
    VisualiserComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(fromRoot.reducers),
    EffectsModule.forRoot([EntitiesEffects]),
    DBModule.provideDB(schema),
    RestangularModule.forRoot(RestangularConfigFactory)
  ],
  providers: [
    ConnecApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
