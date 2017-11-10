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

  public collections(): Observable<String[]> {
    return this.restangular.all('/').get('')
    .map((res: any) => {
      var cols = res._links.map((collection: any) => Object.keys(collection)[0]);
      return cols;
     })
    .catch(error => {
      this.handleError(error)
    });
  }

  public fetchEntities(collection: string, pageSize=100, pageNumber=0): Observable<EntitiesPage> {
    return this.restangular.all('org-fbba').customGET(collection, {'$top': pageSize, '$skip': pageSize * (pageNumber)})
    .map((res: any) => this.extractQueryData(res, collection))
    .catch(error => this.handleError(error));
  }

  private extractQueryData(res: any, collection: string): EntitiesPage {
    const entitiesPage: EntitiesPage = new EntitiesPage([], res['pagination']);

    if(res[collection].constructor == Array) {
      res[collection].forEach((record: any) => {
        const entity: Entity = this.deserializeModel(record);
        entitiesPage.entities.push(entity);
      });
    } else {
      entitiesPage.pagination = {total: 1};
      entitiesPage.entities.push(this.deserializeModel(res[collection]));
    }
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
