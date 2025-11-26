import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../app/screens/LoginScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };

describe('LoginScreen', () => {
  it('renders essential elements (inputs and button)', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('아이디 (이메일)')).toBeTruthy();

    expect(getByPlaceholderText('비밀번호')).toBeTruthy();

    expect(getByText('로그인')).toBeTruthy();
  });
});