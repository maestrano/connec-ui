import { ActionReducerMap } from '@ngrx/store';
import * as fromEntitiesPage from './entities_page';
import { EntitiesPage } from '../models/entities_page';

export interface State {
  entitiesPage: EntitiesPage;
}

export const reducers: ActionReducerMap<State> = {
  entitiesPage: fromEntitiesPage.reducer
};
