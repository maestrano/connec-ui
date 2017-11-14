import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';
import { ProductInstance } from '../models/product_instance';

@Injectable()
export class ConnecApiService {
  apiService;
  channelId = 'org-fbbj';
  authorizationHeader = 'Basic MDQ2ZWViMDAtYWFmYS0wMTM1LTExYmYtNzRkNDM1MTBjMzI2OjBXRUlwNXB2TEYyOUdXb3hNLWNXN0E=';

  constructor(private restangular: Restangular) {
    this.restangular = this.restangular.withConfig((RestangularProvider) => {
      RestangularProvider.setBaseUrl('http://localhost:8080/api/v2');
      RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json', 'CONNEC-EXTERNAL-IDS': true, 'Authorization': this.authorizationHeader});
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

    return this.restangular.all(this.channelId).customGET(collection, options)
    .map((res: any) => this.extractQueryData(res, collection))
    .catch(error => this.handleError(error));
  }

  public fetchEntity(collection: string, id: string): Observable<Entity> {
    return this.restangular.all(this.channelId).one(collection, id).get()
    .map(record => {
      return this.deserializeModel(record[collection])
    })
    .catch(error => this.handleError(error));
  }

  public sendEntityToApplication(entity: Entity, productInstance: ProductInstance) {
    var idMap = entity.id.find(idMap => idMap['provider'] === 'connec');
    var data = {mappings: [{group_id: productInstance.uid, commit: true}]};
    return this.restangular.all(entity.channel_id).one(entity.resource_type, idMap['id'])
    .customPUT(data, 'commit')
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
