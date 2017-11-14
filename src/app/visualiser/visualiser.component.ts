import { Component, OnInit, ViewEncapsulation, ViewChild, Inject, forwardRef } from '@angular/core';
import { Router } from '@angular/router';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';

import { Store, ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';

import { ConnecUiComponent } from '../connec-ui/connec-ui.component';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';
import { ProductInstance } from '../models/product_instance';

import { ConnecApiService } from '../services/connec-api.service';
import { MnoeApiService } from '../services/mnoe-api.service';

@Component({
  selector: 'visualiser',
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VisualiserComponent implements OnInit {
  collections$: Observable<any[]>;
  productInstances$: Observable<ProductInstance[]>;
  productInstances = [];

  dataSource: VisualiserDataSource | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  filterButtonClick$: Observable<any>;

  constructor(
    private router: Router,
    private connecApiService: ConnecApiService,
    private mnoeApiService: MnoeApiService,
    @Inject(forwardRef(() => ConnecUiComponent)) private _parent:ConnecUiComponent
  ) {}

  ngOnInit() {
    this.dataSource = new VisualiserDataSource(this.connecApiService, this.paginator, this.sort, this._parent);

    this.collections$ = this.connecApiService.collections();
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

  sendEntityToApplication(entity: Entity, productInstance: ProductInstance) {
    this.connecApiService.sendEntityToApplication(entity, productInstance);
  }

  navigateToDetails(entity: Entity) {
    var idMap = entity.id.find(idMap => idMap['provider'] === 'connec');
    this.router.navigate(['/visualiser', entity.resource_type, idMap['id']]);
  }
}

export class VisualiserDataSource extends DataSource<any> {
  displayedColumns = ['code', 'name', 'created_at', 'applications', 'actions'];

  pageSize = 100;
  resultsLength = 0;
  isLoadingResults = false;
  attributeValue = undefined;

  constructor(private connecApiService: ConnecApiService,
              private paginator: MatPaginator,
              private sort: MatSort,
              private connecUiComponent: ConnecUiComponent) {
    super();

    this.connecUiComponent.filterButtonClick$ = Observable.fromEvent(this.connecUiComponent.filterButton._elementRef.nativeElement, 'click');
  }

  public connect(): Observable<Entity[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.connecUiComponent.collectionSelector.valueChange,
      this.connecUiComponent.filterButtonClick$
    ];

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        var filter = undefined;
        if(this.connecUiComponent.attributeSelector.value && this.attributeValue) {
          filter = this.connecUiComponent.attributeSelector.value + " match /" + this.attributeValue + "/";
        }
        return this.connecApiService.fetchEntities(this.connecUiComponent.collectionSelector.value, this.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction, filter)
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
