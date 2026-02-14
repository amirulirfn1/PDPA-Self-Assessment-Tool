/**
 * @jest-environment jsdom
 */

import Header from '../Header.js';

jest.mock('../../shared/config/firebase.js', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  return {
    __esModule: true,
    signOut,
    auth: { uid: 'mock-user' }
  };
});

jest.mock('../../shared/services/errorHandler.js', () => ({
  __esModule: true,
  default: {
    showSuccess: jest.fn(),
    showError: jest.fn()
  }
}));

describe('Header.handleLogout', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    window.location.href = '/';
    jest.clearAllMocks();
  });

  it('uses the exported auth instance when signing out', async () => {
    const header = new Header();
    await header.handleLogout();

    const { signOut, auth } = await import('../../shared/config/firebase.js');
    const { default: errorHandler } = await import('../../shared/services/errorHandler.js');

    expect(signOut).toHaveBeenCalledWith(auth);
    expect(errorHandler.showSuccess).toHaveBeenCalledWith('Successfully signed out');
  });
});
