import * as recomponent from "react-recomponent";
import {
  NoUpdate,
  Update,
  SideEffects,
  UpdateWithSideEffects,
  ReComponent,
  RePureComponent
} from "react-recomponent";

NoUpdate; // $ExpectType () => NoUpdateAction
Update; // $ExpectType <T>(state: T) => UpdateAction<T>
SideEffects; // $ExpectType <T>(sideEffect: SideEffect<T>) => SideEffectsAction<T>
UpdateWithSideEffects; // $ExpectType <S, SE>(state: S, sideEffects: SideEffect<SE>) => UpdateWithSideEffectsAction<S, SE>
ReComponent; // $ExpectType typeof ReComponent
RePureComponent; // $ExpectType typeof RePureComponent

recomponent.NoUpdate; // $ExpectType () => NoUpdateAction
recomponent.Update; // $ExpectType <T>(state: T) => UpdateAction<T>
recomponent.SideEffects; // $ExpectType <T>(sideEffect: SideEffect<T>) => SideEffectsAction<T>
recomponent.UpdateWithSideEffects; // $ExpectType <S, SE>(state: S, sideEffects: SideEffect<SE>) => UpdateWithSideEffectsAction<S, SE>
recomponent.ReComponent; // $ExpectType typeof ReComponent
recomponent.RePureComponent; // $ExpectType typeof RePureComponent
