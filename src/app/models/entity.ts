export class Entity {
  id: any;

  // Dynamic attributes
  [key: string]: any

  constructor(data: any) {
    for (let key in data) {
       this[key] = data[key];
    }

    this['friendlyName'] = this.friendlyName();
  }

  public friendlyName() {
    return this.transaction_number || this.payment_reference || this.name || this.full_name || this.reference || this.number || this.title
  }

  public properties() {
    var keys = Object.keys(this);
    for(let ignoredKey of ['id', 'matching_records']) {
      var index = keys.indexOf(ignoredKey);
      if (index !== -1) { keys.splice(index, 1); }
    }

    return keys;
  }
}
