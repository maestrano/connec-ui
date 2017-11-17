export class Entity {
  id: any;

  // Dynamic attributes
  [key: string]: any

  constructor(data: any) {
    for (let key in data) {
       this[key] = data[key];
    }
  }

  public friendlyName() {
    return this.name || this.full_name || this.title || this.reference || this.transaction_number || this.payment_reference || this.number
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
