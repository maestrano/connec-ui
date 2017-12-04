import { Component, OnInit, ViewEncapsulation, Inject, forwardRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { ConnecUiComponent } from '../connec-ui/connec-ui.component';
import { ConnecApiService } from '../services/connec-api.service';

import { EntitiesPage } from '../models/entities_page';
import { Entity } from '../models/entity';

@Component({
  selector: 'app-merge-records',
  templateUrl: './merge-records.component.html',
  styleUrls: ['./merge-records.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MergeRecordsComponent implements OnInit {
  collection: string = null;
  records$: Observable<EntitiesPage>;
  records: EntitiesPage;
  numberRecords: number;

  attributes: string[] = [];
  recordsAttributes: any = {};
  selectedAttributes: any = {};

  jsonSchema$: Observable<any>;
  jsonSchema: any;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public connecApiService: ConnecApiService,
    @Inject(forwardRef(() => ConnecUiComponent)) public _parent: ConnecUiComponent
  ) { }

  ngOnInit() {
    // Force selected collection using route
    this.route.params.subscribe((params: Params) => {
      this._parent.collectionCtrl.setValue(params['collection']);
    });

    this.route.params.subscribe((params: Params) => {
      this.collection = params['collection'];
      this.records = params['records'];

      var filter = '_id in [' + params['records'] + ']';
      Observable.forkJoin(
        // Load json schema
        this.jsonSchema$ = this.connecApiService.jsonSchema(this.collection),
        // Load records
        this.records$ = this.connecApiService.fetchEntities(this.collection, 100, 0, 'created_at', 'ASC', filter)
      ).subscribe(res => {
        // Process Json Schema
        this.jsonSchema = res[0].plain();
        let jsonProperties = this.jsonSchema['properties'][this.collection]['items']['properties'];
        this.attributes = Object.keys(jsonProperties);

        // Process records
        this.records = res[1];
        this.numberRecords = this.records.entities.length;

        // Build an array of properties values
        // this.records.entities.forEach(entity => {
        //   // Take union of properties
        //   this.attributes = this.attributes.concat(entity.properties()).filter((v, i, a) => a.indexOf(v) === i);
        // });

        // Remove non modifiable properties
        for(let ignoredKey of ['id', 'matching_records', 'group_id', 'channel_id', 'resource_type', 'connecId', 'friendlyName', 'created_at', 'updated_at']) {
          var index = this.attributes.indexOf(ignoredKey);
          if (index !== -1) { this.attributes.splice(index, 1); }
        }

        // Build array of records attributes values
        this.attributes.forEach(attribute => {
          this.recordsAttributes[attribute] = this.records.entities.map(record => record[attribute]);
          // Select first non-empty value
          this.selectedAttributes[attribute] = this.records.entities.map(entity => entity[attribute]).find(value => value);
        });
      });
    });
  }

  mergeRecords() {
    let primeRecord: Entity = this.records.entities.find(entity => entity['connecId'] == this.selectedAttributes['id']);
    let mergedRecords: Entity[] = this.records.entities.filter(entity => entity['connecId'] != this.selectedAttributes['id']);

    this.connecApiService.mergeRecords(primeRecord, mergedRecords, this.selectedAttributes)
      .subscribe(record => {
        this.navigateToDetails(record);
        scroll(0,0);
      });
  }

  navigateToCollection() {
    this.router.navigate(['/visualiser', this.collection]);
    scroll(0,0);
  }

  navigateToDetails(entity: Entity) {
    this.router.navigate(['/visualiser', entity.resource_type, entity['connecId']]);
    scroll(0,0);
  }

  isObject(value) {
    return typeof value === 'object';
  }
}
