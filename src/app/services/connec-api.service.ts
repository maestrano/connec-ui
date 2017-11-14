import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';

@Injectable()
export class ConnecApiService {
  apiService;

  constructor(private restangular: Restangular) {
    this.restangular = this.restangular.withConfig((RestangularProvider) => {
      RestangularProvider.setBaseUrl('http://localhost:8080/api/v2');
      RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json', 'CONNEC-EXTERNAL-IDS': true});
      // RestangularProvider.setDefaultHeaders({'Authorization': 'Bearer UDXPx-Xko0w4BRKajozCVy20X11MRZs1'});
      RestangularProvider.setRequestSuffix('.json');

      // Extract collection content
      RestangularProvider.setResponseExtractor(function(response, operation) {
        if (operation === 'getList') {
          return response[Object.keys(response)[0]];
        }
        return response;
      });
    });
  }

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

  public fetchEntities(collection: string, pageSize=100, pageNumber=0, sortColumn=null, sortOrder='ASC', filter=null): Observable<EntitiesPage> {
    var options = {'$top': pageSize, '$skip': pageSize * (pageNumber)};

    // Filter: $filter=code eq 'CT3'
    if(filter) { options['$filter'] = filter; }

    // Order: $orderby=name ASC
    if(sortColumn) { options['$orderby'] = sortColumn + ' ' + sortOrder; }

    return this.restangular.all('org-fbbj').customGET(collection, options)
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
