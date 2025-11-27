// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get fresh token from Clerk
let getClerkToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
  role?: {
    id: string;
    name: string;
    displayName: string;
    description?: string;
  };
}

class UserService {
  private baseUrl = `${API_BASE_URL}/api/users`;

  private async getAuthToken(): Promise<string | null> {
    // Try to get fresh token from Clerk first
    if (getClerkToken) {
      try {
        const freshToken = await getClerkToken();
        if (freshToken) {
          localStorage.setItem('authToken', freshToken);
          return freshToken;
        }
      } catch (error) {
        // Token refresh failed, will use fallback
      }
    }
    // Fallback to localStorage
    return localStorage.getItem('authToken');
  }

  private async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    return this.makeRequest<User[]>(this.baseUrl);
  }

  async getUser(id: string): Promise<User> {
    return this.makeRequest<User>(`${this.baseUrl}/${id}`);
  }

  async createUser(userData: any): Promise<User> {
    return this.makeRequest<User>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any): Promise<User> {
    return this.makeRequest<User>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const userService = new UserService();
export default userService;