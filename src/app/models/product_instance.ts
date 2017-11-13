export class ProductInstance {
  id: string;

  // Dynamic attributes
  [key: string]: any

  constructor(data: any) {
    for (let key in data) {
       this[key] = data[key];
    }
  }
}
