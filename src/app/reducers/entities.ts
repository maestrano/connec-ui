import * as entities from '../actions/entities';
import { Entity } from '../models/entity';

export function reducer(state: Array<Entity>, action: entities.Actions): Array<Entity> {
  switch (action.type) {
    case entities.LOAD: {
      console.log('### DEBUG LOAD', action);
      return state;
    }

    case entities.LOAD_SUCCESS: {
      console.log('### DEBUG LOAD_SUCCESS', action);
      return action.payload;
    }

    default: {
      return state;
    }
  }
}
