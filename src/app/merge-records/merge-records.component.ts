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

  recordsAttributes: any[] = [];
  selectedAttributes: any = {};

  jsonSchema$: Observable<any>;
  jsonSchema: any;
  jsonProperties: any;

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
      var filter = '_id in [' + params['records'] + ']';
      Observable.forkJoin(
        // Load json schema
        this.jsonSchema$ = this.connecApiService.jsonSchema(this.collection),
        // Load records
        this.records$ = this.connecApiService.fetchEntities(this.collection, 100, 0, 'created_at', 'ASC', filter, null, false, [], false)
      ).subscribe(res => {
        // Process Json Schema
        this.jsonSchema = res[0].plain();
        this.jsonProperties = this.jsonSchema['properties'][this.collection]['items']['properties'];

        // Process records
        this.records = res[1];
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
}
