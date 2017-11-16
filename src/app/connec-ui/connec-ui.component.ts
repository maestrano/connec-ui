import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton } from '@angular/material';
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
  collections$: Observable<any[]>;
  productInstances$: Observable<ProductInstance[]>;
  productInstances = [];

  filterableAttributes = ['code', 'name', 'created_at'];
  attributeValue = undefined;

  selectedApplications = {};

  @ViewChild('loader') loader: MatProgressSpinner;
  @ViewChild('collectionSelector') collectionSelector: MatSelect;
  @ViewChild('attributeSelector') attributeSelector: MatSelect;
  @ViewChild('attributeInput') attributeInput: MatInput;
  @ViewChild('filterButton') filterButton: MatButton;

  filterButtonClick$: Observable<any>;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private connecApiService: ConnecApiService,
    private mnoeApiService: MnoeApiService
  ) {}

  ngOnInit() {
    this.initialiseMnoeService();
    this.initialiseConnecService();
  }

  initialiseMnoeService() {
    this.currentUser$ = this.mnoeApiService.currentUser();
    this.productInstances$ = this.mnoeApiService.productInstances();

    // How to extract Observable underlying collection properly?
    this.productInstances$.subscribe((res: any) => {
      res.forEach((record: any) => {
        this.productInstances.push(record);
      })
    });
  }

  initialiseConnecService() {
    this.currentUser$.subscribe((res: any) => {
      this.connecApiService.ssoSession = res['sso_session'];
      this.collections$ = this.connecApiService.collections();
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
