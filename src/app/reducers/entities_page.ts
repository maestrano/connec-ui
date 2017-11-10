import * as entities from '../actions/entities_page';
import { EntitiesPage } from '../models/entities_page';

export function reducer(state: EntitiesPage, action: entities.Actions): EntitiesPage {
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
