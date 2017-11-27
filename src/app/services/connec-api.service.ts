import { Injectable,Inject, forwardRef  } from '@angular/core';
import { URLSearchParams } from '@angular/http'

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { ConnecUiComponent } from '../connec-ui/connec-ui.component';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';
import { ProductInstance } from '../models/product_instance';

@Injectable()
export class ConnecApiService {
  connecHost = 'http://localhost:8080';
  // connecHost = 'https://api-connec-sit.maestrano.io';
  apiService;

  constructor(
    private restangular: Restangular
  ) {
    this.restangular = this.restangular.withConfig((RestangularProvider) => {
      RestangularProvider.setBaseUrl(this.connecHost + '/api/v2');
      RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json', 'CONNEC-EXTERNAL-IDS': true});
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
    return this.restangular.all('/' + sessionStorage.getItem('channelId')).get('', {sso_session: sessionStorage.getItem('ssoSession')})
    .map((res: any) => {
      var cols = res._links.map((collection: any) => Object.keys(collection)[0]);
      return cols;
     })
    .catch(error => {
      this.handleError(error)
    });
  }

  public fetchEntities(collection: string, pageSize=100, pageNumber=0, sortColumn=null, sortOrder='ASC', filter=null, search=null, archived=false, mappings=[]): Observable<EntitiesPage> {
    var options = {'$top': pageSize, '$skip': pageSize * (pageNumber), "mappings[]": [], sso_session: sessionStorage.getItem('ssoSession')};

    mappings.forEach(m => options["mappings[]"].push(JSON.stringify(m)));

    var archiveFilter = '';
    if(archived) {
      archiveFilter = "status eq 'ARCHIVED'";
    } else {
      archiveFilter = "status ne 'ARCHIVED'";
    }

    // Filter: $filter=code eq 'CT3'
    if(filter) { archiveFilter += ' and ' + filter; }
    options['$filter'] = archiveFilter;

    // Search
    if(search) { options['$search'] = search; }

    // Order: $orderby=name ASC
    if(sortColumn) { options['$orderby'] = sortColumn + ' ' + sortOrder; }

    return this.restangular.all(sessionStorage.getItem('channelId')).customGET(collection, options)
    .map((res: any) => this.extractQueryData(res, collection))
    .catch(error => this.handleError(error));
  }

  public fetchEntity(collection: string, id: string): Observable<Entity> {
    return this.restangular.all(sessionStorage.getItem('channelId')).one(collection, id).get({'$expand': 'matching_records', sso_session: sessionStorage.getItem('ssoSession')})
    .map(record => this.deserializeModel(record[collection]))
    .catch(error => this.handleError(error));
  }

  public createEntity(collection: string, data: any): Observable<Entity> {
    return this.restangular.all(sessionStorage.getItem('channelId')).one(collection)
    .customPOST(data, '', {sso_session: sessionStorage.getItem('ssoSession')}, {'CONNEC-EXTERNAL-IDS': false})
    .map(record => this.deserializeModel(record[collection]))
    .catch(error => this.handleError(error));
  }

  public updateEntity(entity: Entity, data: any): Observable<Entity> {
    var idMap = entity.connecId();
    return this.restangular.all(sessionStorage.getItem('channelId')).one(entity.resource_type)
    .customPUT(data, idMap['id'], {sso_session: sessionStorage.getItem('ssoSession')})
    .map(record => this.deserializeModel(record[entity.resource_type]))
    .catch(error => this.handleError(error));
  }

  public sendEntityToApplication(entity: Entity, productInstance: ProductInstance) {
    var idMap = entity.connecId();
    var data = {mappings: [{group_id: productInstance.uid, commit: true}]};
    return this.restangular.all(entity.channel_id).one(entity.resource_type, idMap['id'])
    .customPUT(data, 'commit', {sso_session: sessionStorage.getItem('ssoSession')})
    .catch(error => this.handleError(error));
  }

  public jsonSchema(collection: string): any {
    return this.restangular.one('json_schema', collection).get()
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
