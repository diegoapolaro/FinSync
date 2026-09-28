import '@testing-library/jest-dom';
import React from 'react';

if (typeof globalThis.React === 'undefined') {
  (globalThis as any).React = React;
}
