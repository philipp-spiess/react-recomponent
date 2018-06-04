import { Component, PureComponent } from "react";

import { Re } from "./re";

export {
  NoUpdate,
  Update,
  SideEffects,
  UpdateWithSideEffects
} from "./update-types";

export const ReComponent = Re(Component);
export const RePureComponent = Re(PureComponent);
