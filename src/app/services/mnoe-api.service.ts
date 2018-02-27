import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { RestangularModule, Restangular } from 'ngx-restangular';

import { ProductInstance } from '../models/product_instance';

@Injectable()
export class MnoeApiService {
  apiService;

  constructor(private restangular: Restangular) {
    this.restangular = this.restangular.withConfig((RestangularProvider) => {
      RestangularProvider.setBaseUrl('/mnoe/jpi/v1');
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

  // Fetch current user and store session tokens and organizations
  public configure(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.currentUser().subscribe((user: any) => {
        // Store sso session token
        sessionStorage.setItem('ssoSession', user['sso_session']);

        // User organizations
        const organizations: any[] = [];
        user['organizations'].map(organization => organizations.push(organization));

        // Select Organization
        if (!sessionStorage.getItem('organizationId')) { sessionStorage.setItem('organizationId', organizations[0]['id']); }
        if (!sessionStorage.getItem('channelId')) { sessionStorage.setItem('channelId', organizations[0]['uid']); }

        resolve();
      });
    });

    return promise;
  }

  public systemIdentity(): Observable<any> {
    return this.restangular.one('/system_identity').get()
    .map((res: any) => {
      return res['system_identity'];
    })
    .catch(error => this.handleError(error));
  }

  public currentUser(): Observable<any> {
    return this.restangular.one('/current_user').get()
    .map((res: any) => {
      return res['current_user'];
    })
    .catch(error => this.handleError(error));
  }

  public productInstances(): Observable<ProductInstance[]> {
    return this.restangular.all('/organizations/' + sessionStorage.getItem('organizationId') + '/app_instances').customGET()
    .map((res: any) => this.extractQueryData(res, 'app_instances'))
    .catch(error => this.handleError(error));
  }

  private extractQueryData(res: any, elementName: string): ProductInstance[] {
    const elements = [];
    const data = res[elementName];
    if (!data) { return []; }
    const keys = Object.keys(data);
    const values = keys.map(function(v) { return data[v]; });

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
