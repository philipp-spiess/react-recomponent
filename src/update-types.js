export const NO_UPDATE = 0;
export const UPDATE = 1;
export const SIDE_EFFECTS = 2;
export const UPDATE_WITH_SIDE_EFFECTS = 3;

export function NoUpdate() {
  return {
    type: NO_UPDATE
  };
}

export function Update(state) {
  return {
    type: UPDATE,
    state
  };
}

export function SideEffects(sideEffects) {
  return {
    type: SIDE_EFFECTS,
    sideEffects
  };
}

export function UpdateWithSideEffects(state, sideEffects) {
  return {
    type: UPDATE_WITH_SIDE_EFFECTS,
    state,
    sideEffects
  };
}
