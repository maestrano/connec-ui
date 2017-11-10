import * as entities from '../actions/entities_page';
import { EntitiesPage } from '../models/entities_page';

export function reducer(state: EntitiesPage, action: entities.Actions): EntitiesPage {
  switch (action.type) {
    case entities.LOAD: {
      return state;
    }

    case entities.LOAD_SUCCESS: {
      return action.payload;
    }

    default: {
      return state;
    }
  }
}
