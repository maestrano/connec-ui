import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton, MatCheckbox } from '@angular/material';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { Store, ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';
import { ProductInstance } from '../models/product_instance';

import { ConnecApiService } from '../services/connec-api.service';
import { MnoeApiService } from '../services/mnoe-api.service';

@Component({
  selector: 'connec-ui',
  templateUrl: './connec-ui.component.html',
  styleUrls: ['./connec-ui.component.css'],
  providers: [ConnecApiService],
  encapsulation: ViewEncapsulation.None
})
export class ConnecUiComponent implements OnInit {
  loading = false;
  currentUser$: Observable<any>;
  organizations = [];

  collections$: Observable<any[]>;
  productInstances$: Observable<ProductInstance[]>;
  productInstances = [];

  filterableAttributes = ['code', 'name', 'created_at'];
  attributeValue = undefined;

  selectedApplications = {};

  @ViewChild('loader') loader: MatProgressSpinner;
  @ViewChild('collectionSelector') collectionSelector: MatSelect;
  @ViewChild('organizationSelector') organizationSelector: MatSelect;
  @ViewChild('attributeSelector') attributeSelector: MatSelect;
  @ViewChild('attributeInput') attributeInput: MatInput;
  @ViewChild('checkboxArchived') checkboxArchived: MatCheckbox;
  @ViewChild('filterButton') filterButton: MatButton;

  filterButtonClick$: Observable<any>;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private connecApiService: ConnecApiService,
    private mnoeApiService: MnoeApiService
  ) {}

  ngOnInit() {
    // Fetch current user
    this.currentUser$ = this.mnoeApiService.currentUser();

    // Reload applications on Organization change
    this.organizationSelector.change.subscribe((organization: any) => {
      this.connecApiService.channelId = organization.value['uid'];
      this.mnoeApiService.organizationId = organization.value['id'];

      // Reload product instances
      this.productInstances$ = this.mnoeApiService.productInstances();
    });

    this.currentUser$.subscribe((user: any) => {
      user['organizations'].map(organization => this.organizations.push(organization));
      // Store sso session token
      sessionStorage.setItem('ssoSession', user['sso_session']);

      // Select first Organization
      this.connecApiService.channelId = this.organizations[0]['uid'];
      this.mnoeApiService.organizationId = this.organizations[0]['id'];
      this.organizationSelector.value = this.organizations[0];

      // Available collections
      this.collections$ = this.connecApiService.collections();

      // Load product instances
      this.productInstances$ = this.mnoeApiService.productInstances();
      this.productInstances$.subscribe((res: any) => {
        res.forEach((record: any) => {
          this.productInstances.push(record);
        })
      });
    });
  }

  // Return IdMaps where record has been pushed to external application
  idMapFilter(ids: any): any {
    if(!ids) { return null; }
    return ids.filter(idMap => idMap['id'] && idMap['provider']);
  }

  // Find ProductInstance of an IdMap
  productInstanceFilter(idMap: any): ProductInstance {
    return this.productInstances.find(x => x.uid === idMap['group_id']);
  }

  navigateToCollection(collection: string) {
    this.router.navigate(['/visualiser', collection]);
  }

  changeSelectedApplications() {
    console.log("APPS:", this.selectedApplications);
  }
}
