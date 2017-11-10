import { Action } from '@ngrx/store';
import { EntitiesPage } from '../models/entities_page';

export const LOAD =                 '[Entities] Load';
export const LOAD_SUCCESS =         '[Entities] Load Success';
export const LOAD_FAIL =            '[Entities] Load Fail';

export class LoadAction implements Action {
  readonly type = LOAD;
}

export class LoadSuccessAction implements Action {
  readonly type = LOAD_SUCCESS;

  constructor(public payload: EntitiesPage) { }
}

export class LoadFailAction implements Action {
  readonly type = LOAD_FAIL;

  constructor(public payload: any) { }
}


export type Actions
  = LoadAction
  | LoadSuccessAction
  | LoadFailAction;
