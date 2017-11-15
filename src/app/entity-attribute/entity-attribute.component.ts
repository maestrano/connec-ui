import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { NgPlural } from '@angular/common';

import { ConnecApiService } from '../services/connec-api.service';

import { Observable } from 'rxjs/Observable';
import { Entity } from '../models/entity';

// import { pluralize } from 'pluralize';
import * as pluralize from 'pluralize';

@Component({
  selector: 'app-entity-attribute',
  templateUrl: './entity-attribute.component.html',
  styleUrls: ['./entity-attribute.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EntityAttributeComponent implements OnInit {
  @Input() entity: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private connecApiService: ConnecApiService
  ) { }

  ngOnInit() {

  }

  navigateToDetails(key: string) {
    var collection = pluralize(key.replace('_id',''));

    var idMap = this.entity[key].find(idMap => idMap['provider'] === 'connec');
    this.router.navigate(['/visualiser', collection, idMap['id']]);
  }

  properties() {
    var keys = Object.keys(this.entity);
    var index = keys.indexOf('id');
    if (index !== -1) { keys.splice(index, 1); }
    return keys;
  }

  isIdMap(key) {
    return this.isObject(key) && key.endsWith("_id");
  }

  isObject(key) {
    return typeof this.entity[key] === 'object';
  }

  isArray(key) {
    return Array.isArray(this.entity[key]);
  }
}
