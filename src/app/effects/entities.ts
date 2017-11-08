import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Database } from '@ngrx/db';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { of } from 'rxjs/observable/of';

import * as entitiesAction from '../actions/entities';
import { Entity } from '../models/entity';

import { ConnecApiService } from '../services/connec-api.service';

@Injectable()
export class EntitiesEffects {

  /**
   * This effect does not yield any actions back to the store. Set
   * `dispatch` to false to hint to @ngrx/effects that it should
   * ignore any elements of this effect stream.
   *
   * The `defer` observable accepts an observable factory function
   * that is called when the observable is subscribed to.
   * Wrapping the database open call in `defer` makes
   * effect easier to test.
   */
  @Effect({ dispatch: false })
  openDB$: Observable<any> = defer(() => {
    return this.db.open('connec_entities');
  });

  /**
   * This effect makes use of the `startWith` operator to trigger
   * the effect immediately on startup.
   */
  @Effect()
  loadEntities$: Observable<Action> = this.actions$
    .ofType(entitiesAction.LOAD)
    .startWith(new entitiesAction.LoadAction())
    .mergeMap(() => {
      return this.connecApiService.fetchEntities('contacts')
        .map((entities: Entity[]) => new entitiesAction.LoadSuccessAction(entities))
        .catch(error => of(new entitiesAction.LoadFailAction(error)))
    });

    constructor(
      private actions$: Actions,
      private connecApiService: ConnecApiService,
      private db: Database
    ) {}
}
