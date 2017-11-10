import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';

@Injectable()
export class ConnecApiService {
  apiService;

  constructor(private restangular: Restangular) { }

  public fetchEntities(collection: string, pageSize=100, pageNumber=0): Observable<EntitiesPage> {
    return this.restangular.all('org-fbba').customGET(collection, {'$top': pageSize, '$skip': pageSize * (pageNumber)})
    .map((res: any) => this.extractQueryData(res, collection))
    .catch(error => this.handleError(error));
  }

  private extractQueryData(res: any, collection: string): EntitiesPage {
    console.log("ENTITIES PAGE FETCHED ", res);

    const entitiesPage: EntitiesPage = new EntitiesPage([], res['pagination']);

    res[collection].forEach((record: any) => {
      const entity: Entity = this.deserializeModel(record);
      entitiesPage.entities.push(entity);
    });

    return entitiesPage;
  }

  protected handleError(error: any): ErrorObservable {
    console.error(error);
    return Observable.throw(error);
  }

  private deserializeModel(data: any) {
    return new Entity(data);
  }
}
