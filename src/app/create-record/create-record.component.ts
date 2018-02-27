import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { ConnecApiService } from '../services/connec-api.service';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-record.component.html',
  styleUrls: ['./create-record.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateRecordComponent implements OnInit {
  jsonSchema$: Observable<any>;
  jsonSchema: any;
  collection: string;

  constructor(
    private connecApiService: ConnecApiService,
    public route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      // Load Json schema
      this.collection = params['collection'];
      this.jsonSchema$ = this.connecApiService.jsonSchema(params['collection']);
      this.jsonSchema$.subscribe(schema => this.jsonSchema = schema.plain());
    });
  }

  createRecord(formData) {
    const keys = Object.keys(formData);
    const collection = keys[0];
    const record = formData[collection][0];
    const data = {};
    data[collection] = record;

    this.connecApiService.createEntity(collection, data)
      .subscribe(record => {
        this.router.navigate(['/visualiser', record.resource_type, record.id]);
        scroll(0, 0);
      });
  }

  navigateToCollection(collection: string) {
    this.router.navigate(['/visualiser', collection]);
  }
}
