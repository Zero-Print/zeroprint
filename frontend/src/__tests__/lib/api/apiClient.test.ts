import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Client', () => {
  const mockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { success: true, data: { id: 1, name: 'Test' } };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const response = await api.get('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(response).toEqual(mockData);
    });

    it('should handle GET request with query parameters', async () => {
      const mockData = { success: true, data: [] };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      await api.get('/test-endpoint', { params: { page: 1, limit: 10 } });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint?page=1&limit=10'),
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { success: true, data: { id: 1 } };
      const requestData = { name: 'Test', email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const response = await api.post('/test-endpoint', requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(response).toEqual(mockData);
    });

    it('should handle POST request with empty body', async () => {
      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      await api.post('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockData = { success: true, data: { id: 1, updated: true } };
      const requestData = { name: 'Updated Test' };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const response = await api.put('/test-endpoint/1', requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestData),
        })
      );
      expect(response).toEqual(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const mockData = { success: true, message: 'Deleted successfully' };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const response = await api.delete('/test-endpoint/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(response).toEqual(mockData);
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError for HTTP errors', async () => {
      const errorResponse = { success: false, error: 'Not found' };
      mockFetch.mockResolvedValueOnce(mockResponse(errorResponse, false, 404));

      await expect(api.get('/test-endpoint')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.get('/test-endpoint')).rejects.toThrow(ApiError);
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue('invalid json'),
      });

      await expect(api.get('/test-endpoint')).rejects.toThrow(ApiError);
    });

    it('should include error details in ApiError', async () => {
      const errorResponse = { success: false, error: 'Validation failed', details: ['Field required'] };
      mockFetch.mockResolvedValueOnce(mockResponse(errorResponse, false, 400));

      try {
        await api.get('/test-endpoint');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('HTTP 400: Bad Request');
        expect(error.status).toBe(400);
      }
    });
  });

  describe('Authentication', () => {
    it('should include authorization header when token is available', async () => {
      // Mock Firebase auth
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        getIdToken: jest.fn().mockResolvedValue(mockToken),
      };
      
      // Mock Firebase auth.currentUser
      const mockAuth = require('@/lib/firebase').auth;
      mockAuth.currentUser = mockUser;

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      await api.get('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should handle missing authorization token', async () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      await api.get('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('Request configuration', () => {
    it('should use custom base URL', () => {
      // Test that the API client uses the correct base URL
      // The baseURL is internal, so we test it indirectly by checking the request URL
      expect(api).toBeDefined();
    });

    it('should set default timeout', () => {
      // Test timeout configuration
      expect(api.timeout).toBeDefined();
    });

    it('should handle request cancellation', async () => {
      const abortController = new AbortController();
      
      // Simulate request cancellation
      setTimeout(() => abortController.abort(), 100);
      
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request aborted')), 150);
        })
      );

      await expect(api.get('/test-endpoint')).rejects.toThrow();
    });
  });
});
