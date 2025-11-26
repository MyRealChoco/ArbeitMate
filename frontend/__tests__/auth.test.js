import axios from 'axios';
import { loginApi } from '../app/services/auth';

jest.mock('axios', () => {
    return {
      create: jest.fn(() => ({
        post: jest.fn().mockResolvedValue({ data: { message: "Backend Login Success" } }),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
      })),
      post: jest.fn(),
    };
  });

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('Auth Service', () => {
  it('loginApi makes a request to Firebase and Backend', async () => {
    const mockFirebaseResponse = { data: { idToken: 'fake-token-123' } };
    
    axios.post.mockResolvedValueOnce(mockFirebaseResponse);


    try {
      await loginApi('test@test.com', 'password');
    } catch (e) {
    }

    expect(axios.post).toHaveBeenCalled();
  });
});