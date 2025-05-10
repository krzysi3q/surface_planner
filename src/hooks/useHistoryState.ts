import React from "react";

const initialUseHistoryStateState = {
  past: [],
  present: null,
  future: [],
};

interface UseHistoryState<P> {
  past: P[];
  present: P;
  future: P[];
}

type UseStateSetFunction<P> = (currentState: P) => P

const isCallableSetFunction = <P>(value: P | UseStateSetFunction<P>): value is UseStateSetFunction<P> => {
  return typeof value === "function";
}

type UseHistoryStateAction<P> =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET"; newPresent: P | UseStateSetFunction<P>, skipHistory?: boolean }
  | { type: "CLEAR"; initialPresent: P }
  | { type: "PERSIST" };


const useHistoryStateReducer = <P,>(state: UseHistoryState<P>, action: UseHistoryStateAction<P>) => {
  const { past, present, future } = state;

  if (action.type === "UNDO") {
    return {
      past: past.slice(0, past.length - 1),
      present: past[past.length - 1],
      future: [present, ...future],
    };
  } else if (action.type === "REDO") {
    return {
      past: [...past, present],
      present: future[0],
      future: future.slice(1),
    };
  } else if (action.type === "SET") {
    const { newPresent, skipHistory } = action;
    const newState = isCallableSetFunction(newPresent) ? newPresent(present) : newPresent;

    if (newState === state) {
      return state;
    }

    return {
      past: skipHistory ? past : [...past, present],
      present: newState,
      future: [],
    };
  } else if (action.type === "CLEAR") {
    return {
      ...initialUseHistoryStateState,
      present: action.initialPresent,
    };
  } else if (action.type === "PERSIST") {
    return {
      past: [...past, present],
      present,
      future: [],
    };
  } else {
    throw new Error("Unsupported action type");
  }
};

export function useHistoryState<P>(initialPresent: P) {
  const initialPresentRef = React.useRef(initialPresent);

  const [state, dispatch] = React.useReducer(useHistoryStateReducer<P>, {
    ...initialUseHistoryStateState,
    present: initialPresentRef.current,
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = React.useCallback(() => {
    if (canUndo) {
      dispatch({ type: "UNDO" });
    }
  }, [canUndo]);

  const redo = React.useCallback(() => {
    if (canRedo) {
      dispatch({ type: "REDO" });
    }
  }, [canRedo]);

  const set = React.useCallback(
    (newPresent: P | UseStateSetFunction<P>, skipHistory: boolean = false) => dispatch({ type: "SET", newPresent, skipHistory }),
    []
  );

  const clear = React.useCallback(
    () =>
      dispatch({ type: "CLEAR", initialPresent: initialPresentRef.current }),
    []
  );

  /*
    * Persist the current state to the past history.
    * This is useful when you want to save the current state
    * without creating a new state in the future.
    */
  const persist = React.useCallback(() => {
    dispatch({ type: "PERSIST" });
  }, []);

  return { state: state.present, set, undo, redo, clear, persist, canUndo, canRedo };
}