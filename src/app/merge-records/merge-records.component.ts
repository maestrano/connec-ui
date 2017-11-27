import { Component, OnInit, ViewEncapsulation, Inject, forwardRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';

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

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public connecApiService: ConnecApiService,
    @Inject(forwardRef(() => ConnecUiComponent)) public _parent: ConnecUiComponent
  ) { }

  ngOnInit() {
    // Force selected collection using route
    this._parent.currentUser$.subscribe((res: any) => {
      this.route.params.subscribe((params: Params) => {
        this._parent.collectionCtrl.setValue(params['collection']);
      });
    });

    this.route.params.subscribe((params: Params) => {
      this.collection = params['collection'];
      this.records = params['records'];

      // Load records
      var filter = '_id in [' + params['records'] + ']';
      this.records$ = this.connecApiService.fetchEntities(this.collection, 100, 0, 'created_at', 'ASC', filter);
      this.records$.subscribe(records => this.records = records);
    });
  }
}
