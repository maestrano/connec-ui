import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { ProductInstance } from '../models/product_instance';

@Injectable()
export class MnoeApiService {
  apiService;
  organizationId = undefined;

  constructor(private restangular: Restangular) {
    this.restangular = this.restangular.withConfig((RestangularProvider) => {
      RestangularProvider.setBaseUrl('http://localhost:8081/mnoe/jpi/v1');
      RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json'});
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

  public currentUser(): Observable<any> {
    return this.restangular.one('/current_user').get()
    .map((res: any) => {
      return res['current_user'];
    })
    .catch(error => this.handleError(error));
  }

  public productInstances(): Observable<ProductInstance[]> {
    return this.restangular.all('/organizations/' + this.organizationId + '/app_instances').customGET()
    .map((res: any) => this.extractQueryData(res, 'app_instances'))
    .catch(error => this.handleError(error));
  }

  private extractQueryData(res: any, elementName: string): ProductInstance[] {
    var elements = [];
    var data = res[elementName];
    var keys = Object.keys(data);
    var values = keys.map(function(v) { return data[v]; });

    values.forEach((record: any) => {
      const product: ProductInstance = this.deserializeModel(record);
      elements.push(product);
    });

    return elements;
  }

  protected handleError(error: any): ErrorObservable {
    console.error(error);
    return Observable.throw(error);
  }

  private deserializeModel(data: any) {
    return new ProductInstance(data);
  }
}
