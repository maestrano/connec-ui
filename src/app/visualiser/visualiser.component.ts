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

import { ConnecApiService } from '../services/connec-api.service';

@Component({
  selector: 'connec-visualiser',
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VisualiserComponent implements OnInit {
  collections$: Observable<any[]>;

  dataSource: VisualiserDataSource | null;

  @ViewChild('collectionSelector') collectionSelector: MatSelect;
  @ViewChild('attributeSelector') attributeSelector: MatSelect;
  @ViewChild('attributeInput') attributeInput: MatInput;
  @ViewChild('filterButton') filterButton: MatButton;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  filterButtonClick$: Observable<any>;

  constructor(private connecApiService: ConnecApiService) {}

  ngOnInit() {
    this.dataSource = new VisualiserDataSource(this.connecApiService, this.collectionSelector, this.attributeSelector, this.attributeInput, this.filterButton, this.paginator, this.sort, this.filterButtonClick$);
    this.collections$ = this.connecApiService.collections();
    this.collectionSelector.value = 'company';
    this.filterButtonClick$ = Observable.fromEvent(this.filterButton._elementRef.nativeElement, 'click');
  }
}

export class VisualiserDataSource extends DataSource<any> {
  displayedColumns = ['id', 'code', 'name', 'created_at'];


  pageSize = 100;
  resultsLength = 0;
  isLoadingResults = false;

  constructor(private connecApiService: ConnecApiService,
              private collectionSelector: MatSelect,
              private attributeSelector: MatSelect,
              private attributeInput: MatInput,
              private filterButton: MatButton,
              private paginator: MatPaginator,
              private sort: MatSort,
              private filterButtonClick$: Observable<any>) {
    super();
  }

  public connect(): Observable<Entity[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.collectionSelector.valueChange
    ];

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        return this.connecApiService.fetchEntities(this.collectionSelector.value, this.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction)
      })
      .map(data => {
        this.isLoadingResults = false;
        this.resultsLength = data.pagination['total'];

        return data.entities;
      })
      .catch(() => {
        this.isLoadingResults = false;
        return Observable.of([]);
      });
  }

  public disconnect() {}
}
