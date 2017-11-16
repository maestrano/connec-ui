import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, Inject, ChangeDetectorRef, forwardRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

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
  collectionChange$: Observable<any[]>;
  collection = undefined;
  productInstances$: Observable<ProductInstance[]>;
  productInstances = [];

  dataSource: VisualiserDataSource | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  filterButtonClick$: Observable<any>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public connecApiService: ConnecApiService,
    public mnoeApiService: MnoeApiService,
    @Inject(forwardRef(() => ConnecUiComponent)) public _parent:ConnecUiComponent
  ) {
    this.collections$ = this.connecApiService.collections();
    this.productInstances$ = this.mnoeApiService.productInstances();

    // How to extract Observable underlying collection properly?
    this.productInstances$.subscribe((res: any) => {
      res.forEach((record: any) => {
        this.productInstances.push(record);
      })
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.collection = params['collection'];
      this._parent.collectionSelector.value = this.collection;
      return this.dataSource = new VisualiserDataSource(this);
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
  connecUiComponent: ConnecUiComponent;
  paginator: MatPaginator;
  sort: MatSort;
  connecApiService: ConnecApiService;

  displayedColumns = ['code', 'name', 'created_at', 'applications', 'actions'];

  pageSize = 100;
  resultsLength = 0;

  constructor(private visualiserComponent: VisualiserComponent) {
    super();

    this.connecUiComponent = visualiserComponent._parent;
    this.paginator = visualiserComponent.paginator;
    this.sort = visualiserComponent.sort;
    this.connecApiService = visualiserComponent.connecApiService;

    this.connecUiComponent.filterButtonClick$ = Observable.fromEvent(this.connecUiComponent.filterButton._elementRef.nativeElement, 'click');
  }

  public connect(): Observable<Entity[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.connecUiComponent.filterButtonClick$
    ];

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        if(!this.visualiserComponent.collection) { return []; }

        this.connecUiComponent.loading = true;

        // Apply attribute filter
        var filter = '';
        if(this.connecUiComponent.attributeSelector.value && this.visualiserComponent.collection) {
          filter = this.connecUiComponent.attributeSelector.value + " match /" + this.connecUiComponent.attributeValue + "/";
        }

        // Apply applications filter
        var selectedApplications = this.connecUiComponent.selectedApplications;
        for (var application in selectedApplications) {
          if (selectedApplications[application]) {
            if(filter) { filter += ' AND '; }
            filter += "id.group_id eq '" + application + "'";
          }
        }

        return this.connecApiService.fetchEntities(this.visualiserComponent.collection, this.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction, filter)
      })
      .map(entityPage => {
        this.resultsLength = entityPage.pagination['total'];
        this.connecUiComponent.loading = false;

        return entityPage.entities;
      })
      .catch(() => {
        this.connecUiComponent.loading = false;
        return Observable.of([]);
      });
  }

  public disconnect() {}
}
