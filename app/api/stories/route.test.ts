import { createMocks } from 'node-mocks-http';
import { POST } from './route';

describe('API Route: /api/stories', () => {
  it('should create a story successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test Story', mainCharacter: 'Hero' },
      headers: { 'Authorization': 'Bearer valid_token' }, // Mock authorization header
    });

    await POST(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.story).toBeDefined();
  });

  it('should return 401 for unauthorized access', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test Story', mainCharacter: 'Hero' },
    });

    await POST(req, res);

    expect(res._getStatusCode()).toBe(401);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Unauthorized - Please sign in');
  });

  it('should return 500 for invalid input', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}, // Invalid input
      headers: { 'Authorization': 'Bearer valid_token' },
    });

    await POST(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Failed to save story');
  });
});
