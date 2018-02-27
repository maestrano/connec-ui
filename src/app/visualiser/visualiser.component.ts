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
  encapsulation: ViewEncapsulation.None
})
export class VisualiserComponent implements OnInit {
  jsonSchema$: Observable<any>;
  jsonSchema: any;

  dataSource: VisualiserDataSource | null;
  collection: string;

  availableAttributes: any[] = [{name: 'friendlyName', type: 'string', description: 'Friendly name', icon: 'text_format'}];
  selectedAttributes: any;

  selectedRecords: any = {};
  numberRecordsSelected = 0;

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
    // Set pre-selected attributes
    if (sessionStorage.getItem('connec-selected-attributes-' + this.collection)) {
      this.selectedAttributes = JSON.parse(sessionStorage.getItem('connec-selected-attributes-' + this.collection));
    } else {
      this.selectedAttributes = {code: true, friendlyName: true, created_at: true};
    }
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

        const json_properties = this.jsonSchema['properties'][this.collection]['items']['properties'];
        const properties = Object.keys(json_properties);
        properties.forEach(property => {
          if (['resource_type', 'channel_id', 'group_id'].indexOf(property) == -1) {
            const propertyHash = json_properties[property];
            if (['string', 'number', 'boolean'].indexOf(propertyHash['type']) != -1) {
              propertyHash['name'] = property;

              // Icon to display
              if (propertyHash['name'] === 'id') {
                propertyHash['icon'] = 'vpn_key';
              } else if (propertyHash['name'].endsWith('_id')) {
                propertyHash['icon'] = 'compare_arrows';
              } else if (propertyHash['type'] === 'number') {
                propertyHash['icon'] = 'keyboard';
              } else if (propertyHash['type'] === 'boolean') {
                propertyHash['icon'] = 'remove';
              } else if (propertyHash['type'] === 'string') {
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

    // Reset pre-defined filters on new search
    this._parent.filterButtonClick$.subscribe((res: any) => this.dataSource.filter = '');
  }

  reloadData() {
    this.dataSource = new VisualiserDataSource(this);
  }

  // Selection of attributes to display as table columns
  selectAttribute($event, selectedAttribute) {
    this.selectedAttributes[selectedAttribute] = !this.selectedAttributes[selectedAttribute];
    if (this.selectedAttributes[selectedAttribute]) {
      let index = this.dataSource.selectedAttributes.indexOf(selectedAttribute);
      if (index == -1) { this.dataSource.selectedAttributes.push(selectedAttribute); }
      index = this.dataSource.displayedAttributes.indexOf(selectedAttribute);
      if (index == -1) { this.dataSource.displayedAttributes.splice(this.dataSource.displayedAttributes.length - 2, 0, selectedAttribute); }
    } else {
      let index = this.dataSource.selectedAttributes.indexOf(selectedAttribute);
      if (index != -1) { this.dataSource.selectedAttributes.splice(index, 1); }
      index = this.dataSource.displayedAttributes.indexOf(selectedAttribute);
      if (index != -1) { this.dataSource.displayedAttributes.splice(index, 1); }
    }

    // Store in session
    // sessionStorage.setItem('connec-selected-attributes-' + this.collection, JSON.stringify(this.selectedAttributes));

    $event.stopPropagation();
  }

  // Return IdMaps where record has been pushed to external application
  // Keep only 1 IdMap per group_id
  idMapFilter(ids: any): any {
    if (!ids) { return null; }
    const filteredIds = [];
    ids.filter(idMap => idMap['id'] && idMap['provider']).forEach(idMap => {
      if (!filteredIds.some(filteredId => filteredId['group_id'] === idMap['group_id'])) {
        filteredIds.push(idMap);
      }
    });
    return filteredIds;
  }

  // Find ProductInstance of an IdMap
  productInstanceFilter(idMap: any): ProductInstance {
    return this._parent.productInstances.find(x => x.uid === idMap['group_id']);
  }

  sendEntityToApplication(entity: Entity, productInstance: ProductInstance) {
    this.connecApiService.sendEntityToApplication(entity, productInstance);
  }

  archiveEntity(entity: Entity) {
    const data = {};
    data[entity.resource_type] = {status: 'ARCHIVED'};
    this.connecApiService.updateEntity(entity, data).subscribe(res => this._parent.triggerDataReload());
  }

  restoreEntity(entity: Entity) {
    const data = {};
    data[entity.resource_type] = {status: ''};
    this.connecApiService.updateEntity(entity, data).subscribe(res => this._parent.triggerDataReload());
  }

  navigateToDetails(entity: Entity) {
    this.router.navigate(['/visualiser', entity.resource_type, entity['connecId']]);
    scroll(0, 0);
  }

  navigateToCreateRecord() {
    this.router.navigate(['/visualiser', this.collection, 'new']);
    scroll(0, 0);
  }

  // Display dialog box to select attributes to match record against
  openSearchSimilarDialog(entity: Entity) {
    const dialogRef = this.dialog.open(SearchSimilarDialog);
    dialogRef.componentInstance.entity = entity;

    // On Dialog close
    dialogRef.afterClosed().subscribe(result => {
      // Get back to results first page
      this.paginator.pageIndex = 0;
      const selectedAttributes = dialogRef.componentInstance.selectedAttributes;
      // Set attributes filters based on selected values
      for (const key of Object.keys(selectedAttributes)) {
        if (selectedAttributes[key]) {
          this._parent.attributeFilters[key]['enabled'] = true;
          this._parent.attributeFilters[key]['operator'] = 'eq';
          this._parent.attributeFilters[key]['value'] = entity[key];
        }
      }
      this.dataSource = new VisualiserDataSource(this);
    });
  }

  unselectAll() {
    this.selectedRecords = {};
    this.numberRecordsSelected = 0;
  }

  recordSelectionChange() {
    const keys = Object.keys(this.selectedRecords);
    this.numberRecordsSelected = keys.filter(key => this.selectedRecords[key]).length;
  }

  mergeRecords() {
    const keys = Object.keys(this.selectedRecords);
    const records = keys.filter(key => this.selectedRecords[key]).map(key => key);
    this.router.navigate(['/visualiser', this.collection, 'merge', {records: records}]);
    scroll(0, 0);
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
  search = '';

  pageSize = 100;
  resultsLength = 0;

  constructor(private visualiserComponent: VisualiserComponent) {
    super();

    this.connecUiComponent = visualiserComponent._parent;
    this.paginator = visualiserComponent.paginator;
    this.sort = visualiserComponent.sort;
    this.connecApiService = visualiserComponent.connecApiService;

    // Initialise list of columns
    for (const selectedAttribute in this.visualiserComponent.selectedAttributes) {
      if (this.visualiserComponent.selectedAttributes[selectedAttribute]) {
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
      this.connecUiComponent.checkboxArchived.change,
      this.connecUiComponent.reloadDataTrigger
    ];

    // If the user changes the sort order, reset back to the first page
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    // If user selects Archived records, reset back to the first page
    this.connecUiComponent.checkboxArchived.change.subscribe(() => this.paginator.pageIndex = 0);

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        if (!this.connecUiComponent.collectionCtrl.value) { return []; }

        this.connecUiComponent.loading = true;

        // Apply attributes filters
        const filters: string[] = [];
        const keys = Object.keys(this.connecUiComponent.attributeFilters);
        keys.forEach(key => {
          const attributeFilter = this.connecUiComponent.attributeFilters[key];
          if (attributeFilter['enabled']) {
            switch (attributeFilter['operator']) {
              case 'match': {
                if (attributeFilter['value'] && attributeFilter['value'].length > 0) {
                  filters.push(key + ' ' + attributeFilter['operator'] + ' /' + attributeFilter['value'] + '/');
                }
                break;
              }
              case 'empty': {
                filters.push(key + ' eq null');
                break;
              }
              case 'not_empty': {
                filters.push(key + ' ne null');
                break;
              }
              default: {
                // Escape string with single quote
                let value = attributeFilter['value'];
                if (attributeFilter['type'] === 'string') { value = '\'' + value + '\''; }

                filters.push(key + ' ' + attributeFilter['operator'] + ' ' + value);
                break;
              }
            }
          }
        });
        this.filter = filters.join(' AND ');

        // Apply applications filter
        const mappings = [];
        const selectedApplications = this.connecUiComponent.selectedApplications;
        for (const selectedApplication of Object.keys(selectedApplications)) {
          if (selectedApplications[selectedApplication] == 'include') { mappings.push({group_id: selectedApplication, include: true}); }
          if (selectedApplications[selectedApplication] == 'exclude') { mappings.push({group_id: selectedApplication, exclude: true}); }
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
