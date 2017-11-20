import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

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

  // Navigate to the association
  // key: association name (eg: organization_id)
  navigateToDetails(key: string) {
    var collection = undefined;
    if(key.endsWith("_id")) {
      // Association: {organization_id: '234214'}
      collection = pluralize(key.replace('_id', ''));
    } else {
      // Handle polymorphic links: {class: 'Invoice', id: '8273'}
      collection = pluralize(this.entity['class'].toLowerCase());
    }

    // Find Connec! IdMap
    var idMap = this.connecIdMap(this.entity[key]);
    this.router.navigate(['/visualiser', collection, idMap['id']]);
  }

  properties() {
    // Ignore properties id and matching_records
    var keys = Object.keys(this.entity);
    var ignoredKeys = ['matching_records'];
    if(keys.indexOf('class') == -1) { ignoredKeys.push('id'); }

    for(let ignoredKey of ignoredKeys) {
      var index = keys.indexOf(ignoredKey);
      if (index !== -1) { keys.splice(index, 1); }
    }

    return keys;
  }

  isIdMap(key) {
    return this.isObject(key) && (key === "id" || key.endsWith("_id"));
  }

  isObject(key) {
    return typeof this.entity[key] === 'object';
  }

  isArray(key) {
    return Array.isArray(this.entity[key]);
  }

  connecIdMap(idMaps: Array<string>) {
    return idMaps.find(idMap => idMap['provider'] === 'connec');
  }
}
