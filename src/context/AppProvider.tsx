import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AppSettings, Route } from '../types';
import { initDatabase } from '../storage/database';
import { getSettings, saveSettings } from '../storage/settingsStorage';
import { getAllRoutes, saveRoute, deleteRoute } from '../storage/routeStorage';

// State
interface AppState {
  settings: AppSettings;
  routes: Route[];
  isLoading: boolean;
}

const initialState: AppState = {
  settings: {
    mapSource: 'israel-hiking',
    units: 'metric',
    mapOrientation: 'north-up',
  },
  routes: [],
  isLoading: true,
};

// Actions
type AppAction =
  | { type: 'INIT_COMPLETE'; settings: AppSettings; routes: Route[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'ADD_ROUTE'; route: Route }
  | { type: 'REMOVE_ROUTE'; routeId: string };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT_COMPLETE':
      return {
        ...state,
        settings: action.settings,
        routes: action.routes,
        isLoading: false,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    case 'ADD_ROUTE':
      return {
        ...state,
        routes: [action.route, ...state.routes],
      };
    case 'REMOVE_ROUTE':
      return {
        ...state,
        routes: state.routes.filter(r => r.id !== action.routeId),
      };
    default:
      return state;
  }
}

// Context
interface AppContextValue extends AppState {
  updateSettings: (settings: Partial<AppSettings>) => void;
  addRoute: (route: Route) => void;
  removeRoute: (routeId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    initDatabase();
    const settings = getSettings();
    const routes = getAllRoutes();
    dispatch({ type: 'INIT_COMPLETE', settings, routes });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    saveSettings(newSettings);
    dispatch({ type: 'UPDATE_SETTINGS', settings: newSettings });
  }, []);

  const addRoute = useCallback((route: Route) => {
    saveRoute(route);
    dispatch({ type: 'ADD_ROUTE', route });
  }, []);

  const removeRoute = useCallback((routeId: string) => {
    deleteRoute(routeId);
    dispatch({ type: 'REMOVE_ROUTE', routeId });
  }, []);

  const value: AppContextValue = {
    ...state,
    updateSettings,
    addRoute,
    removeRoute,
  };

  if (state.isLoading) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
