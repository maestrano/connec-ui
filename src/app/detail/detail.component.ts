import { Component, OnInit, ViewEncapsulation, ViewChild, Inject, forwardRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ConnecUiComponent } from '../connec-ui/connec-ui.component';
import { ConnecApiService } from '../services/connec-api.service';

import { Observable } from 'rxjs/Observable';
import { Entity } from '../models/entity';
import { EntitiesPage } from '../models/entities_page';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnInit {
  entity$: Observable<Entity>;
  entity: Entity;
  editEntityData: any = {};

  matchingRecords$: Observable<EntitiesPage>;
  matchingRecords: EntitiesPage;

  jsonSchema$: Observable<any>;
  jsonSchema: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private connecApiService: ConnecApiService,
    private _location: Location,
    public dialog: MatDialog,
    @Inject(forwardRef(() => ConnecUiComponent)) public _parent: ConnecUiComponent
  ) { }

  ngOnInit() {
    this.loadEntity();

    // Force selected collection using route
    this.route.params.subscribe((params: Params) => {
      this._parent.collectionCtrl.setValue(params['collection']);
      this.loadEntity();
      this.jsonSchema$ = this.connecApiService.jsonSchema(params['collection']);
      this.jsonSchema$.subscribe(schema => {
        this.jsonSchema = schema.plain();
      });
    });
  }

  loadEntity() {
    // Fetch entity
    this.entity$ = this.route.params.switchMap((params: Params) => {
      this._parent.loading = true;
      return this.connecApiService.fetchEntity(params['collection'], params['id']);
    });

    // On entity load, fetch matching records
    this.entity$.subscribe(entity => {
      this._parent.loading = false;
      this.entity = entity;
      this.editEntityData[this.entity.resource_type] = [this.entity];

      // Fetch matching records
      if (this.entity.matching_records) {
        let filter = '_id in ';
        const ids = this.entity.matching_records.map(record => {
          if (!record.match_id) { return ''; }
          return '\'' + record.match_id.find(idMap => idMap['provider'] === 'connec')['id'] + '\'';
        }).join(',');
        filter += '[' + ids + ']';

        this.matchingRecords$ = this.connecApiService.fetchEntities(this.entity.resource_type, 100, 0, 'created_at', 'ASC', filter);
        this.matchingRecords$.subscribe(matchingRecords => this.matchingRecords = matchingRecords);
      }
    });
  }

  updateEntity($event) {
    const data = {};
    data[this.entity.resource_type] = this.editEntityData[this.entity.resource_type][0];
    this.connecApiService.updateEntity(this.entity, data);
  }

  navigateToCollection(collection: string) {
    this.router.navigate(['/visualiser', collection]);
    scroll(0, 0);
  }

  navigateToDetails(entity: Entity) {
    this.router.navigate(['/visualiser', entity.resource_type, entity['connecId']]);
    scroll(0, 0);
  }
}
