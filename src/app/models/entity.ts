export class Entity {
  id: any;

  // Dynamic attributes
  [key: string]: any

  constructor(data: any) {
    for (const key in data) {
       this[key] = data[key];
    }

    this['connecId'] = this.connecId();
    this['friendlyName'] = this.friendlyName();
  }

  public connecId() {
    return this.isString(this.id) ? this.id : this.id.find(idMap => idMap['provider'] === 'connec')['id'];
  }

  public friendlyName() {
    return this.transaction_number || this.payment_reference || this.name || this.full_name || this.reference || this.number || this.title;
  }

  public properties(): string[] {
    const keys: string[] = Object.keys(this);
    for (const ignoredKey of ['id', 'matching_records']) {
      const index = keys.indexOf(ignoredKey);
      if (index !== -1) { keys.splice(index, 1); }
    }

    return keys;
  }

  private isString(value) {
    return typeof value === 'string' || value instanceof String;
  }
}
