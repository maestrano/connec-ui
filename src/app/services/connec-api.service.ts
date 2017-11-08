import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { Entity } from '../models/entity';

@Injectable()
export class ConnecApiService {
  apiService;

  constructor(private restangular: Restangular) { }

  public fetchEntities(collection: any): Observable<Entity[]> {
    return this.restangular.all('org-fbba').customGET(collection)
    .map((res: any) => this.extractQueryData(res[collection]))
    .catch(error => this.handleError(error));
  }

  private extractQueryData(res: any): Entity[] {
    const entities: Entity[] = [];

    res.forEach((data: any) => {
      const entity: Entity = this.deserializeModel(data);
      entities.push(entity);
    });
    console.log("ENTITIES FETCHED ", entities);
    return entities;
  }

  protected handleError(error: any): ErrorObservable {
    console.error(error);
    return Observable.throw(error);
  }

  private deserializeModel(data: any) {
    return new Entity(data);
  }
}
