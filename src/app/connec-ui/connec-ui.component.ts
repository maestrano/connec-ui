import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton } from '@angular/material';

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
  encapsulation: ViewEncapsulation.None
})
export class ConnecUiComponent implements OnInit {
  collections$: Observable<any[]>;
  productInstances$: Observable<ProductInstance[]>;
  productInstances = [];

  filterableAttributes = ['code', 'name', 'created_at'];

  @ViewChild('collectionSelector') collectionSelector: MatSelect;
  @ViewChild('attributeSelector') attributeSelector: MatSelect;
  @ViewChild('attributeInput') attributeInput: MatInput;
  @ViewChild('filterButton') filterButton: MatButton;

  filterButtonClick$: Observable<any>;

  constructor(
    private router: Router,
    private connecApiService: ConnecApiService,
    private mnoeApiService: MnoeApiService
  ) {}

  ngOnInit() {
    this.collections$ = this.connecApiService.collections();
    this.collectionSelector.value = 'contacts';

    this.productInstances$ = this.mnoeApiService.productInstances();

    // How to extract Observable underlying collection properly?
    this.productInstances$.subscribe((res: any) => {
      res.forEach((record: any) => {
        this.productInstances.push(record);
      })
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
}
