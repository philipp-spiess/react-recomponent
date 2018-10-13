import { Component } from "react";

export enum UpdateType {
  NO_UPDATE = 0,
  UPDATE = 1,
  SIDE_EFFECTS = 2,
  UPDATE_WITH_SIDE_EFFECTS = 3
}

export type SideEffect<T> = (this: T) => any;

export type NoUpdateAction = {
  type: UpdateType.NO_UPDATE;
};

export type UpdateAction<T> = {
  type: UpdateType.UPDATE;
  state: T;
};

export type SideEffectsAction<T> = {
  type: UpdateType.SIDE_EFFECTS;
  sideEffects: SideEffect<T>;
};

export type UpdateWithSideEffectsAction<S, SE> = {
  type: UpdateType.UPDATE_WITH_SIDE_EFFECTS;
  state: S;
  sideEffects: SideEffect<SE>;
};

export type ReducerAction<S, SE> =
  | NoUpdateAction
  | UpdateAction<S>
  | SideEffectsAction<SE>
  | UpdateWithSideEffectsAction<S, SE>;

export function NoUpdate(): NoUpdateAction;

export function Update<T>(state: T): UpdateAction<T>;

export function SideEffects<T>(sideEffect: SideEffect<T>): SideEffectsAction<T>;

export function UpdateWithSideEffects<S, SE>(
  state: S,
  sideEffects: SideEffect<SE>
): UpdateWithSideEffectsAction<S, SE>;

export type Action = {
  type: string;
};

export class ReComponent<P = {}, S = {}> extends Component<P, S> {
  static reducer<TState, TAction extends Action, TSideEffect = any>(
    action: Action,
    state: TState
  ): ReducerAction<TState, TSideEffect>;

  send<TAction extends Action>(action: TAction): void;

  createSender<TAction extends string>(
    type: TAction
  ): (<TPayload>(payload: TPayload) => { type: TAction; payload: TPayload });
}

export class RePureComponent<P = {}, S = {}> extends ReComponent<P, S> {}
