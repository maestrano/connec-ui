import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, Inject, forwardRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton, MatDialog } from '@angular/material';
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
  providers: [ConnecApiService],
  encapsulation: ViewEncapsulation.None
})
export class VisualiserComponent implements OnInit {
  dataSource: VisualiserDataSource | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  filterButtonClick$: Observable<any>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public connecApiService: ConnecApiService,
    public mnoeApiService: MnoeApiService,
    public dialog: MatDialog,
    @Inject(forwardRef(() => ConnecUiComponent)) public _parent:ConnecUiComponent
  ) {

  }

  ngOnInit() {
    this.reloadData();

    // Load data after current user has been initialised
    this._parent.currentUser$.subscribe((res: any) => {
      this.connecApiService.channelId = this._parent.organizationSelector.value['uid'];

      // Force selected collection using route
      this.route.params.subscribe((params: Params) => {
        this._parent.collectionCtrl.setValue(params['collection']);
        this.reloadData();
      });
    });

    // Reset pre-defined filters on new search
    this._parent.filterButtonClick$.subscribe((res: any) => this.dataSource.filter = '');
  }

  reloadData() {
    this.dataSource = new VisualiserDataSource(this);
  }

  // Return IdMaps where record has been pushed to external application
  idMapFilter(ids: any): any {
    if(!ids) { return null; }
    return ids.filter(idMap => idMap['id'] && idMap['provider']);
  }

  // Find ProductInstance of an IdMap
  productInstanceFilter(idMap: any): ProductInstance {
    return this._parent.productInstances.find(x => x.uid === idMap['group_id']);
  }

  sendEntityToApplication(entity: Entity, productInstance: ProductInstance) {
    this.connecApiService.sendEntityToApplication(entity, productInstance);
  }

  archiveEntity(entity: Entity) {
    var data = {};
    data[entity.resource_type] = {status: 'ARCHIVED'};
    this.connecApiService.updateEntity(entity, data);
  }

  restoreEntity(entity: Entity) {
    var data = {};
    data[entity.resource_type] = {status: ''};
    this.connecApiService.updateEntity(entity, data);
  }

  navigateToDetails(entity: Entity) {
    var idMap = entity.id.find(idMap => idMap['provider'] === 'connec');
    this.router.navigate(['/visualiser', entity.resource_type, idMap['id']]);
  }

  openDialog(entity: Entity) {
    const dialogRef = this.dialog.open(SearchSimilarDialog);
    dialogRef.componentInstance.entity = entity;
    dialogRef.afterClosed().subscribe(result => {
      var filter = '';
      this.paginator.pageIndex = 0;
      var selectedAttributes = dialogRef.componentInstance.selectedAttributes;
      for(let key of Object.keys(selectedAttributes)) {
        if(selectedAttributes[key]) {
          if(filter) { filter += ' and '; }
          filter += key + ' match /' + entity[key] + '/';
        }
      }
      this.dataSource = new VisualiserDataSource(this);
      this.dataSource.filter = filter;
    });
  }
}

export class VisualiserDataSource extends DataSource<any> {
  connecUiComponent: ConnecUiComponent;
  paginator: MatPaginator;
  sort: MatSort;
  connecApiService: ConnecApiService;

  displayedColumns = ['code', 'name', 'created_at', 'applications', 'actions'];
  filter = '';

  pageSize = 100;
  resultsLength = 0;

  constructor(private visualiserComponent: VisualiserComponent) {
    super();

    this.connecUiComponent = visualiserComponent._parent;
    this.paginator = visualiserComponent.paginator;
    this.sort = visualiserComponent.sort;
    this.connecApiService = visualiserComponent.connecApiService;
  }

  public connect(): Observable<Entity[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.connecUiComponent.autoComplete.optionSelected,
      this.connecUiComponent.organizationSelector.change,
      this.connecUiComponent.checkboxArchived.change,
      this.connecUiComponent.filterButtonClick$
    ];

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        if(!this.connecUiComponent.collectionCtrl.value) { return []; }

        this.connecUiComponent.loading = true;

        this.connecApiService.channelId = this.connecUiComponent.organizationSelector.value['uid'];

        // Apply attribute filter
        if(this.connecUiComponent.attributeSelector.value && this.connecUiComponent.collectionCtrl.value) {
          this.filter = this.connecUiComponent.attributeSelector.value + " match /" + this.connecUiComponent.attributeValue + "/";
        }

        // Apply applications filter
        var selectedApplications = this.connecUiComponent.selectedApplications;
        for (var application in selectedApplications) {
          if (selectedApplications[application]) {
            if(this.filter) { this.filter += ' AND '; }
            this.filter += "id.group_id eq '" + application + "'";
          }
        }

        return this.connecApiService.fetchEntities(this.connecUiComponent.collectionCtrl.value, this.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction, this.filter, this.connecUiComponent.checkboxArchived.checked);
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

@Component({
  selector: 'connec-search-similar-dialog',
  templateUrl: 'connec-search-similar-dialog.html',
})
export class SearchSimilarDialog {
  entity: Entity;
  selectedAttributes = {};

  isObject(key) {
    return typeof this.entity[key] === 'object';
  }
}
