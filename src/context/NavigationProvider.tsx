import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { NavigationState, Route } from '../types';
import {
  startTracking,
  stopTracking,
  LocationUpdate,
} from '../services/locationService';
import { startCompass, stopCompass } from '../services/compassService';

// State
interface NavState extends NavigationState {
  isTracking: boolean;
}

const initialState: NavState = {
  activeRoute: null,
  userPosition: null,
  mapOrientation: 'north-up',
  isFollowingUser: true,
  isTracking: false,
};

// Actions
type NavAction =
  | { type: 'SET_ACTIVE_ROUTE'; route: Route | null }
  | { type: 'UPDATE_POSITION'; position: LocationUpdate }
  | { type: 'UPDATE_HEADING'; heading: number }
  | { type: 'SET_ORIENTATION'; orientation: 'north-up' | 'heading-up' }
  | { type: 'SET_FOLLOWING'; following: boolean }
  | { type: 'SET_TRACKING'; tracking: boolean };

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'SET_ACTIVE_ROUTE':
      return { ...state, activeRoute: action.route };
    case 'UPDATE_POSITION':
      return {
        ...state,
        userPosition: {
          lat: action.position.lat,
          lon: action.position.lon,
          accuracy: action.position.accuracy,
          heading: state.userPosition?.heading ?? 0,
          speed: action.position.speed,
        },
      };
    case 'UPDATE_HEADING':
      if (!state.userPosition) {
        return state;
      }
      return {
        ...state,
        userPosition: {
          ...state.userPosition,
          heading: action.heading,
        },
      };
    case 'SET_ORIENTATION':
      return { ...state, mapOrientation: action.orientation };
    case 'SET_FOLLOWING':
      return { ...state, isFollowingUser: action.following };
    case 'SET_TRACKING':
      return { ...state, isTracking: action.tracking };
    default:
      return state;
  }
}

// Context
interface NavigationContextValue extends NavState {
  setActiveRoute: (route: Route | null) => void;
  toggleOrientation: () => void;
  setFollowingUser: (following: boolean) => void;
  startGpsTracking: () => Promise<void>;
  stopGpsTracking: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

// Provider
interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, dispatch] = useReducer(navReducer, initialState);

  const setActiveRoute = useCallback((route: Route | null) => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', route });
  }, []);

  const toggleOrientation = useCallback(() => {
    dispatch({
      type: 'SET_ORIENTATION',
      orientation:
        state.mapOrientation === 'north-up' ? 'heading-up' : 'north-up',
    });
  }, [state.mapOrientation]);

  const setFollowingUser = useCallback((following: boolean) => {
    dispatch({ type: 'SET_FOLLOWING', following });
  }, []);

  const startGpsTracking = useCallback(async () => {
    await startTracking((position) => {
      dispatch({ type: 'UPDATE_POSITION', position });
    });
    startCompass((heading) => {
      dispatch({ type: 'UPDATE_HEADING', heading });
    });
    dispatch({ type: 'SET_TRACKING', tracking: true });
  }, []);

  const stopGpsTracking = useCallback(() => {
    stopTracking();
    stopCompass();
    dispatch({ type: 'SET_TRACKING', tracking: false });
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      stopCompass();
    };
  }, []);

  const value: NavigationContextValue = {
    ...state,
    setActiveRoute,
    toggleOrientation,
    setFollowingUser,
    startGpsTracking,
    stopGpsTracking,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
