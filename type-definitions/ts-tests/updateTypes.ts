import { NoUpdate, Update, SideEffects, UpdateWithSideEffects } from 'react-recomponent';

// $ExpectType NoUpdateAction
NoUpdate();

// $ExpectType UpdateAction<number>
Update<number>(4);

// $ExpectType SideEffectsAction<any>
SideEffects<any>(() => {});
// $ExpectError
SideEffects<any>({});

// $ExpectType UpdateWithSideEffectsAction<number, any>
UpdateWithSideEffects<number, any>(4, () => {});
// $ExpectError
UpdateWithSideEffects<number, any>(4, {});
