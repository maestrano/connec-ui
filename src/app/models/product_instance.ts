export class ProductInstance {
  id: string;

  // Dynamic attributes
  [key: string]: any

  constructor(data: any) {
    for (const key in data) {
       this[key] = data[key];
    }
  }
}
