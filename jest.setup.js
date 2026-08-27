/* eslint-disable no-undef */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      Image: require('react-native').Image,
      ScrollView: require('react-native').ScrollView,
      FlatList: require('react-native').FlatList,
      createAnimatedComponent: (c) => c,
      timing: () => ({ start: (cb) => cb && cb() }),
      spring: () => ({ start: (cb) => cb && cb() }),
      Value: jest.fn(() => ({ setValue: jest.fn() })),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      interpolate: jest.fn(),
      useSharedValue: (init) => ({ value: init }),
      useAnimatedStyle: (fn) => fn(),
      useDerivedValue: (fn) => ({ value: fn() }),
      useAnimatedGestureHandler: () => ({}),
      withTiming: (val) => val,
      withSpring: (val) => val,
      withDecay: (val) => val,
      withSequence: (...vals) => vals[0],
      withRepeat: (val) => val,
      cancelAnimation: jest.fn(),
    },
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (fn) => fn(),
    useDerivedValue: (fn) => ({ value: fn() }),
    useAnimatedGestureHandler: () => ({}),
    withTiming: (val) => val,
    withSpring: (val) => val,
    withDecay: (val) => val,
    withSequence: (...vals) => vals[0],
    withRepeat: (val) => val,
    cancelAnimation: jest.fn(),
    createAnimatedComponent: (c) => c,
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@react-native-community/geolocation', () => ({
  addListener: jest.fn(),
  getCurrentPosition: jest.fn(),
  removeListeners: jest.fn(),
  requestAuthorization: jest.fn(),
  setRNConfiguration: jest.fn(),
  stopObserving: jest.fn(),
  watchPosition: jest.fn(),
}));
