/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @see https://github.com/facebook/immutable-js/blob/v4.0.0-rc.9/src/Predicates.js
 */

export function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}

function isCollection(maybeCollection) {
  return !!(maybeCollection && maybeCollection[IS_ITERABLE_SENTINEL]);
}

function isRecord(maybeRecord) {
  return !!(maybeRecord && maybeRecord[IS_RECORD_SENTINEL]);
}

export const IS_ITERABLE_SENTINEL = "@@__IMMUTABLE_ITERABLE__@@";
export const IS_RECORD_SENTINEL = "@@__IMMUTABLE_RECORD__@@";
