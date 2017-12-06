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
  @Input() selectedAttributes: any; // User selected attributes

  numberRecords: number;
  hasNestedProperties: any = {};

  constructor() {

  }

  ngOnInit() {
    this.numberRecords = this.records.length;

    this.properties().forEach(key => {
      this.hasNestedProperties[key] = this.records.some(record => (record[key] && this.isObject(record[key])));
      let defaultValue = this.records.map(record => (record[key] && !this.isArray(record[key]) && !this.isObject(record[key])) ? record[key].toString() : record[key])
                                     .find(value => value);
      this.selectedAttributes[key] = this.copyValue(defaultValue);
    })
  }

  isArray(value) {
    return Array.isArray(value);
  }

  isObject(value) {
    return !this.isArray(value) && typeof value === 'object';
  }

  copyValue(value) {
    return this.isObject(value) ? Object.assign({}, value) : value;
  }

  hasValue(obj) {
    return (
      (!this.isObject(obj) && !!obj) // Empty string
      || (this.isArray(obj) && obj.length > 0) // Empty array
      || (this.isObject(obj) && Object.keys(obj).length > 0 && Object.keys(obj).some(key => this.hasValue(obj[key]))) // Empty object
     );
  }

  // Return available properties with a selectable value
  properties() {
    // Find keys based on JSON Schema or available properties
    let keys = [];
    if(this.jsonProperties) {
      keys = Object.keys(this.jsonProperties)
    } else {
      this.records.forEach(record => {
        Object.keys(record).forEach(attribute => {
          if (keys.indexOf(attribute) == -1) { keys.push(attribute); }
        })
      });
    }

    // Remove keys with only wmpty values
    keys = keys.filter(key => this.records.some(record => this.hasValue(record[key])));

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
