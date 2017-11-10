import { Entity } from './entity';

export class EntitiesPage {
  entities: Entity[];
  pagination: any;

  constructor(entities: Entity[], pagination: any) {
    this.entities = entities;
    this.pagination = pagination;
  }
}
