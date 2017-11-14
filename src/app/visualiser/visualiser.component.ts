import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';

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
  selector: 'connec-visualiser',
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VisualiserComponent implements OnInit {
  collections$: Observable<any[]>;
  productInstances$: Observable<ProductInstance[]>;
  productInstances = [];

  dataSource: VisualiserDataSource | null;

  @ViewChild('collectionSelector') collectionSelector: MatSelect;
  @ViewChild('attributeSelector') attributeSelector: MatSelect;
  @ViewChild('attributeInput') attributeInput: MatInput;
  @ViewChild('filterButton') filterButton: MatButton;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  filterButtonClick$: Observable<any>;

  constructor(
    private connecApiService: ConnecApiService,
    private mnoeApiService: MnoeApiService
  ) {}

  ngOnInit() {
    this.dataSource = new VisualiserDataSource(this.connecApiService, this.collectionSelector, this.attributeSelector, this.filterButton, this.paginator, this.sort, this.filterButtonClick$);

    this.collections$ = this.connecApiService.collections();
    this.collectionSelector.value = 'contacts';

    this.productInstances$ = this.mnoeApiService.productInstances();

    // How to extract Observable underlying collection properly?
    this.productInstances$.forEach((res: any) => {
      res.forEach((record: any) => {
        this.productInstances.push(record);
      })
    });
  }

  // Return IdMaps where record has been pushed to external application
  idMapFilter(ids: any): any {
    return ids.filter(idMap => idMap['id'] && idMap['provider']);
  }

  // Find ProductInstance of an IdMap
  productInstanceFilter(idMap: any): ProductInstance {
    return this.productInstances.find(x => x.uid === idMap['group_id']);
  }
}

export class VisualiserDataSource extends DataSource<any> {
  defaultAttributes = ['code', 'name', 'created_at'];
  displayedColumns = Object.assign([], this.defaultAttributes);

  pageSize = 100;
  resultsLength = 0;
  isLoadingResults = false;
  attributeValue = undefined;

  constructor(private connecApiService: ConnecApiService,
              private collectionSelector: MatSelect,
              private attributeSelector: MatSelect,
              private filterButton: MatButton,
              private paginator: MatPaginator,
              private sort: MatSort,
              private filterButtonClick$: Observable<any>) {
    super();

    this.displayedColumns.push('applications');
    this.displayedColumns.push('actions');
    this.filterButtonClick$ = Observable.fromEvent(this.filterButton._elementRef.nativeElement, 'click');
  }

  public connect(): Observable<Entity[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.collectionSelector.valueChange,
      this.filterButtonClick$
    ];

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        var filter = undefined;
        if(this.attributeSelector.value && this.attributeValue) {
          filter = this.attributeSelector.value + " match /" + this.attributeValue + "/";
        }
        return this.connecApiService.fetchEntities(this.collectionSelector.value, this.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction, filter)
      })
      .map(entityPage => {
        this.resultsLength = entityPage.pagination['total'];
        this.isLoadingResults = false;

        return entityPage.entities;
      })
      .catch(() => {
        this.isLoadingResults = false;
        return Observable.of([]);
      });
  }

  public disconnect() {}
}
