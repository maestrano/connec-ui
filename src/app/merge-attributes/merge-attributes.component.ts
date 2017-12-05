import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-merge-attributes',
  templateUrl: './merge-attributes.component.html',
  styleUrls: ['./merge-attributes.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MergeAttributesComponent implements OnInit {
  @Input() records: any[]; // Records to select values from
  @Input() jsonProperties: any; // Json schema properties of the records

  numberRecords: number;
  hasNestedProperties: any = {};
  selectedAttributes: any = {};

  constructor() {

  }

  ngOnInit() {
    this.numberRecords = this.records.length;

    this.properties().forEach(key => {
      this.hasNestedProperties[key] = this.records.some(record => (record[key] && this.isObject(record[key])));
      let defaultValue = this.records.map(record => (record[key] && !this.isArray(record[key]) && !this.isObject(record[key])) ? record[key].toString() : record[key])
                                     .find(value => value);
      this.selectedAttributes[key] = defaultValue;
    })
  }

  isArray(value) {
    return Array.isArray(value);
  }

  isObject(value) {
    return !this.isArray(value) && typeof value === 'object';
  }

  isNotEmpty(obj) {
    return (
      !!obj // Empty object or string
      || (this.isArray(obj) && obj.length > 0) // Empty array
      || (this.isObject(obj) && Object.keys(obj).some(key => this.isNotEmpty(obj[key]))) // Empty object
     );
  }

  // Return available properties with a selectable value
  properties() {
    let keys = this.jsonProperties ? Object.keys(this.jsonProperties) : Object.keys(this.records[0]);
    keys = keys.filter(key => this.records.some(record => this.isNotEmpty(record[key])));

    // Remove non modifiable properties
    for(let ignoredKey of ['id', 'matching_records', 'group_id', 'channel_id', 'resource_type', 'connecId', 'friendlyName', 'created_at', 'updated_at']) {
      var index = keys.indexOf(ignoredKey);
      if (index !== -1) { keys.splice(index, 1); }
    }

    return keys;
  }

  subRecords(attribute) {
    return this.records.map(record => record[attribute]);
  }
}
