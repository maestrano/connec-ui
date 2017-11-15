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
    return this.name || this.full_name || this.title || this.reference || this.transaction_number || this.payment_reference
  }
}
