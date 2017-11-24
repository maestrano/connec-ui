import { Component, OnInit, AfterViewInit, Directive, ViewEncapsulation, ViewChild, ViewChildren, QueryList, Inject, forwardRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { MatPaginator, MatSort, MatSelect, MatInput, MatButton, MatDialog, MatCheckbox } from '@angular/material';
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
  jsonSchema$: Observable<any>;
  jsonSchema: any;

  dataSource: VisualiserDataSource | null;
  collection: string;

  availableAttributes: any[] = [{name: 'friendlyName', type: 'string', description: 'Friendly name', icon: 'text_format'}];
  selectedAttributes: any = {code: true, friendlyName: true, created_at: true};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChildren(MatCheckbox) attributeCheckboxes: QueryList<MatCheckbox>;

  filterButtonClick$: Observable<any>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public connecApiService: ConnecApiService,
    public mnoeApiService: MnoeApiService,
    public dialog: MatDialog,
    @Inject(forwardRef(() => ConnecUiComponent)) public _parent: ConnecUiComponent
  ) {

  }

  ngOnInit() {
    this.reloadData();

    // Force selected collection using route
    this.route.params.subscribe((params: Params) => {
      this.collection = params['collection'];
      this._parent.collectionCtrl.setValue(params['collection']);

      // Get collection JSON schema
      this.jsonSchema$ = this.connecApiService.jsonSchema(this.collection);
      this.jsonSchema$.subscribe(schema => {
        this.jsonSchema = schema.plain();

        // Extract list of collection available properties
        this.availableAttributes = [{name: 'friendlyName', type: 'string', description: 'Friendly name', icon: 'text_format'}];
        this.selectedAttributes = {code: true, friendlyName: true, created_at: true};

        let json_properties = this.jsonSchema['properties'][this.collection]['items']['properties'];
        let properties = Object.keys(json_properties);
        properties.forEach(property => {
          if(['resource_type', 'channel_id', 'group_id'].indexOf(property) == -1) {
            let propertyHash = json_properties[property];
            if(['string', 'number', 'boolean'].indexOf(propertyHash['type']) != -1) {
              propertyHash['name'] = property;

              // Icon to display
              if (propertyHash['name'] === "id") {
                propertyHash['icon'] = 'vpn_key';
              } else if (propertyHash['name'].endsWith("_id")) {
                propertyHash['icon'] = 'compare_arrows';
              } else if (propertyHash['type'] === 'number') {
                propertyHash['icon'] = 'keyboard';
              } else if (propertyHash['type'] === 'boolean') {
                propertyHash['icon'] = 'check_box';
              } else if(propertyHash['type'] === 'string') {
                if (propertyHash['format'] === 'date-time') {
                  propertyHash['icon'] = 'date_range';
                } else {
                  propertyHash['icon'] = 'text_format';
                }
              } else {
                propertyHash['icon'] = 'compare_arrows';
              }

              this.availableAttributes.push(propertyHash);
            }
          }
        });
      });
    });

    // Load data after current user has been initialised
    this._parent.currentUser$.subscribe((res: any) => {
      this.reloadData();
    });

    // Reset pre-defined filters on new search
    this._parent.filterButtonClick$.subscribe((res: any) => this.dataSource.filter = '');
  }

  reloadData() {
    this.dataSource = new VisualiserDataSource(this);
  }

  selectAttribute($event, selectedAttribute) {
    this.selectedAttributes[selectedAttribute] = !this.selectedAttributes[selectedAttribute];
    if(this.selectedAttributes[selectedAttribute]) {
      let index = this.dataSource.selectedAttributes.indexOf(selectedAttribute);
      if(index == -1) { this.dataSource.selectedAttributes.push(selectedAttribute); }
      index = this.dataSource.displayedAttributes.indexOf(selectedAttribute);
      if(index == -1) { this.dataSource.displayedAttributes.splice(this.dataSource.displayedAttributes.length - 2, 0, selectedAttribute); }
    } else {
      let index = this.dataSource.selectedAttributes.indexOf(selectedAttribute);
      if(index != -1) { this.dataSource.selectedAttributes.splice(index, 1); }
      index = this.dataSource.displayedAttributes.indexOf(selectedAttribute);
      if(index != -1) { this.dataSource.displayedAttributes.splice(index, 1); }
    }

    $event.stopPropagation();
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
    scroll(0,0);
  }

  navigateToCreateRecord() {
    this.router.navigate(['/visualiser', this.collection, 'new']);
    scroll(0,0);
  }

  // Display dialog box to select attributes to match record against
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

  selectedAttributes: string[] = [];
  displayedAttributes: string[] = [];

  filter = '';
  search = ''

  pageSize = 100;
  resultsLength = 0;

  constructor(private visualiserComponent: VisualiserComponent) {
    super();

    this.connecUiComponent = visualiserComponent._parent;
    this.paginator = visualiserComponent.paginator;
    this.sort = visualiserComponent.sort;
    this.connecApiService = visualiserComponent.connecApiService;

    // Initialise list of columns
    for(let selectedAttribute in this.visualiserComponent.selectedAttributes) {
      if(this.visualiserComponent.selectedAttributes[selectedAttribute]) {
        this.selectedAttributes.push(selectedAttribute);
        this.displayedAttributes.push(selectedAttribute);
      }
    }
    this.displayedAttributes.push('applications');
    this.displayedAttributes.push('actions');
  }

  public connect(): Observable<Entity[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.connecUiComponent.autoComplete.optionSelected,
      this.connecUiComponent.organizationSelector.change,
      this.connecUiComponent.filterButtonClick$,
      this.connecUiComponent.clearSearchButtonClick$,
      this.connecUiComponent.reloadDataTrigger
    ];

    // If the user changes the sort order, reset back to the first page
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    // If user selects Archived records, reset back to the first page
    this.connecUiComponent.checkboxArchived.change.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        if(!this.connecUiComponent.collectionCtrl.value) { return []; }

        this.connecUiComponent.loading = true;

        // Apply attributes filters
        let filters: string[] = [];
        let keys = Object.keys(this.connecUiComponent.attributeFilters);
        keys.forEach(key => {
          let attributeFilter = this.connecUiComponent.attributeFilters[key];
          if(attributeFilter['enabled']) {
            filters.push(key + ' ' + attributeFilter['operator'] + " '" + attributeFilter['value'] + "'");
          }
        })
        this.filter = filters.join(' AND ');

        // Apply applications filter
        const mappings = [];
        var selectedApplications = this.connecUiComponent.selectedApplications;
        for (let selectedApplication of Object.keys(selectedApplications)) {
          if (selectedApplications[selectedApplication]) {
            mappings.push({group_id: selectedApplication, include: true});
          }
        }

        return this.connecApiService.fetchEntities(this.connecUiComponent.collectionCtrl.value, this.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction, this.filter, this.connecUiComponent.attributeValue, this.connecUiComponent.checkboxArchived.checked, mappings);
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
