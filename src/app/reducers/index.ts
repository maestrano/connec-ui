import { ActionReducerMap } from '@ngrx/store';
import * as fromEntities from './entities';
import { Entity } from '../models/entity';

export interface State {
  entities: Array<Entity>;
}

export const reducers: ActionReducerMap<State> = {
  entities: fromEntities.reducer
};
