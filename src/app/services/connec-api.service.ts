import { Injectable,Inject, forwardRef  } from '@angular/core';
import { URLSearchParams } from '@angular/http'

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { MnoeApiService } from '../services/mnoe-api.service';

import { ConnecUiComponent } from '../connec-ui/connec-ui.component';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';
import { ProductInstance } from '../models/product_instance';

@Injectable()
export class ConnecApiService {
  config$: Observable<any>;
  config: any;
  apiService;

  constructor(
    private restangular: Restangular,
    private mnoeApiService: MnoeApiService,
  ) {
    this.configure();
  }

  // Fetch environment settings (Connec! endpoint)
  public configure(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      // Fetch Config
      this.config$ = this.mnoeApiService.systemIdentity();
      this.config$.subscribe(res => {
        this.config = res;
        this.restangular = this.restangular.withConfig((RestangularProvider) => {
          RestangularProvider.setBaseUrl(this.config['connec_endpoint'] + '/api/v2');
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

        resolve();
      });
    });

    return promise;
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
    return this.restangular.all(sessionStorage.getItem('channelId')).one(entity.resource_type)
    .customPUT(data, entity['connecId'], {sso_session: sessionStorage.getItem('ssoSession')})
    .map(record => this.deserializeModel(record[entity.resource_type]))
    .catch(error => this.handleError(error));
  }

  public mergeRecords(primeRecord: Entity, mergedRecords: Entity[], selectedAttributes: any) {
    var data = {ids: mergedRecords.map(entity => entity['connecId'])};
    data[primeRecord.resource_type] = selectedAttributes;
    return this.restangular.all(primeRecord.channel_id).one(primeRecord.resource_type, primeRecord['connecId'])
    .customPUT(data, 'merge', {sso_session: sessionStorage.getItem('ssoSession')}, {'CONNEC-EXTERNAL-IDS': false})
    .map(record => {
      return this.deserializeModel(record[primeRecord.resource_type])
    })
    .catch(error => this.handleError(error));
  }

  public sendEntityToApplication(entity: Entity, productInstance: ProductInstance) {
    var data = {mappings: [{group_id: productInstance.uid, commit: true}]};
    return this.restangular.all(entity.channel_id).one(entity.resource_type, entity['connecId'])
    .customPUT(data, 'commit', {sso_session: sessionStorage.getItem('ssoSession')})
    .catch(error => this.handleError(error));
  }

  public jsonSchema(collection: string): Observable<any> {
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
